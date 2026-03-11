import uuid
from flask import Blueprint, request, jsonify, send_from_directory
import os
from api.auth.routes import token_required
from models.apartment import Unit, UnitStatus, Tower
from models.booking import Booking, BookingStatus
from models.lease import Lease, LeaseStatus
from models.maintenance import MaintenanceRequest, MaintenanceStatus
from models.payment import Payment
from models.review import Review
from extensions import db
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from models.activity import ActivityLog
from lease_pdf import generate_lease_pdf

user_bp = Blueprint('user', __name__)


# ==========================================
# Helpers
# ==========================================
def cancel_expired_bookings():
    """Lazily cancel any approved bookings that have exceeded the 6-hour payment window."""
    six_hours_ago = datetime.utcnow() - timedelta(hours=6)
    expired_bookings = Booking.query.filter(
        Booking.status == BookingStatus.APPROVED,
        Booking.approved_at < six_hours_ago
    ).all()
    
    cancel_count = 0
    for eb in expired_bookings:
        # Double check if any lease was created (just in case)
        has_lease = Lease.query.filter_by(booking_id=eb.id).first()
        if not has_lease:
            eb.status = BookingStatus.CANCELLED
            if eb.unit:
                eb.unit.status = 'AVAILABLE'
            cancel_count += 1
    
    if cancel_count > 0:
        db.session.commit()

# ==========================================
# Towers
# ==========================================
@user_bp.route('/towers', methods=['GET'])
@token_required
def get_towers(current_user):
    cancel_expired_bookings()
    query = Tower.query.filter(Tower.status != 'INACTIVE')

    # Location filters
    city    = request.args.get('city', '').strip()
    area    = request.args.get('area', '').strip()
    pincode = request.args.get('pincode', '').strip()
    search  = request.args.get('search', '').strip()

    if city:
        query = query.filter(Tower.city.ilike(f'%{city}%'))
    if area:
        query = query.filter(Tower.area.ilike(f'%{area}%'))
    if pincode:
        query = query.filter(Tower.pincode.ilike(f'%{pincode}%'))
    if search:
        like = f'%{search}%'
        query = query.filter(
            db.or_(
                Tower.name.ilike(like),
                Tower.city.ilike(like),
                Tower.area.ilike(like),
                Tower.pincode.ilike(like),
                Tower.address_line.ilike(like),
            )
        )

    towers = query.all()
    results = []
    for t in towers:
        data = t.to_dict()
        data['available_units_count'] = Unit.query.filter_by(tower_id=t.id, status='AVAILABLE', is_deleted=False).count()
        results.append(data)
    return jsonify(results), 200


@user_bp.route('/locations', methods=['GET'])
@token_required
def get_locations(current_user):
    """Return distinct city/area/pincode values for filter dropdowns."""
    from sqlalchemy import distinct
    cities   = [r[0] for r in db.session.query(distinct(Tower.city)).filter(Tower.city != None, Tower.status != 'INACTIVE').all()]
    areas    = [r[0] for r in db.session.query(distinct(Tower.area)).filter(Tower.area != None, Tower.status != 'INACTIVE').all()]
    pincodes = [r[0] for r in db.session.query(distinct(Tower.pincode)).filter(Tower.pincode != None, Tower.status != 'INACTIVE').all()]
    return jsonify({
        'cities':   sorted(filter(None, cities)),
        'areas':    sorted(filter(None, areas)),
        'pincodes': sorted(filter(None, pincodes)),
    }), 200


@user_bp.route('/towers/nearby', methods=['GET'])
@token_required
def get_nearby_towers(current_user):
    """Return towers sorted by distance using Haversine formula."""
    import math
    try:
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))
        radius_km = float(request.args.get('radius_km', 10))
    except (TypeError, ValueError):
        return jsonify({'message': 'lat, lng required'}), 400

    towers = Tower.query.filter(Tower.status != 'INACTIVE', Tower.latitude != None, Tower.longitude != None).all()

    def haversine(lat1, lng1, lat2, lng2):
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
        return R * 2 * math.asin(math.sqrt(a))

    results = []
    for t in towers:
        dist = haversine(lat, lng, t.latitude, t.longitude)
        if dist <= radius_km:
            data = t.to_dict()
            data['distance_km'] = round(dist, 2)
            data['available_units_count'] = Unit.query.filter_by(tower_id=t.id, status='AVAILABLE', is_deleted=False).count()
            results.append(data)

    results.sort(key=lambda x: x['distance_km'])
    return jsonify(results), 200



# ==========================================
# Units Search + Recommendations
# ==========================================
@user_bp.route('/units/search', methods=['GET'])
@token_required
def search_units(current_user):
    cancel_expired_bookings()
    tower_id = request.args.get('tower_id', type=int)
    min_rent = request.args.get('min_rent', type=float)
    max_rent = request.args.get('max_rent', type=float)
    flat_type = request.args.get('flat_type', type=str)
    floor_number = request.args.get('floor_number', type=int)
    sort_by = request.args.get('sort_by', default='score', type=str)
    amenities = request.args.getlist('amenities', type=int)

    query = Unit.query.filter_by(status='AVAILABLE', is_deleted=False)

    if tower_id:
        query = query.filter_by(tower_id=tower_id)
    if flat_type:
        query = query.filter_by(flat_type=flat_type)
    if floor_number:
        query = query.filter_by(floor_number=floor_number)
    if min_rent:
        query = query.filter(Unit.rent_amount >= min_rent)
    if max_rent:
        query = query.filter(Unit.rent_amount <= max_rent)

    all_units = query.all()

    results = []
    for unit in all_units:
        score = 0

        # Budget preference scoring — prefer mid-range
        if min_rent and max_rent:
            if min_rent <= unit.rent_amount <= max_rent:
                score += 50
            elif (min_rent * 0.9) <= unit.rent_amount <= (max_rent * 1.1):
                score += 20

        # Amenity match scoring
        if amenities:
            unit_amenity_ids = [a.id for a in unit.amenities]
            match_count = len(set(amenities).intersection(set(unit_amenity_ids)))
            score += (match_count * 10)

        # More amenities = better
        score += len(unit.amenities) * 2

        # Bigger sqft = bonus
        if unit.square_feet and unit.square_feet > 1000:
            score += 5

        unit_data = unit.to_dict()
        unit_data['recommendation_score'] = score
        results.append(unit_data)

    # Sort
    if sort_by == 'price_asc':
        results.sort(key=lambda x: x.get('rent_amount', 0))
    elif sort_by == 'price_desc':
        results.sort(key=lambda x: x.get('rent_amount', 0), reverse=True)
    elif sort_by == 'newest':
        results.sort(key=lambda x: x.get('id', 0), reverse=True)
    else:
        results.sort(key=lambda x: x['recommendation_score'], reverse=True)

    return jsonify({'message': 'Recommended for You', 'units': results}), 200


@user_bp.route('/recommendations', methods=['GET'])
@token_required
def get_recommendations(current_user):
    """Smart recommendations across all towers."""
    tower_id = request.args.get('tower_id', type=int)
    max_rent = request.args.get('max_rent', type=float)
    flat_type = request.args.get('flat_type', type=str)

    # Get user's booking history for preference learning
    past_bookings = Booking.query.filter_by(user_id=current_user.id).all()
    preferred_flat_types = {}
    for b in past_bookings:
        unit = Unit.query.get(b.unit_id)
        if unit:
            preferred_flat_types[unit.flat_type] = preferred_flat_types.get(unit.flat_type, 0) + 1

    preferred_type = max(preferred_flat_types, key=preferred_flat_types.get) if preferred_flat_types else None

    query = Unit.query.filter_by(status='AVAILABLE', is_deleted=False)
    if tower_id:
        query = query.filter_by(tower_id=tower_id)
    if flat_type:
        query = query.filter_by(flat_type=flat_type)
    if max_rent:
        query = query.filter(Unit.rent_amount <= max_rent * 1.15)  # within 15%

    all_units = query.all()
    results = []

    for unit in all_units:
        score = 0

        # Budget fit
        if max_rent:
            if unit.rent_amount <= max_rent:
                score += 40
            elif unit.rent_amount <= max_rent * 1.1:
                score += 20
            elif unit.rent_amount <= max_rent * 1.15:
                score += 5

        # Preferred flat type from history
        if preferred_type and unit.flat_type == preferred_type:
            score += 30
        elif flat_type and unit.flat_type == flat_type:
            score += 25

        # More amenities = higher score
        score += len(unit.amenities) * 5

        # Higher sqft bonus
        if unit.square_feet:
            score += min(unit.square_feet // 200, 10)

        unit_data = unit.to_dict()
        unit_data['recommendation_score'] = score
        results.append(unit_data)

    # Return top 10 by score
    results.sort(key=lambda x: x['recommendation_score'], reverse=True)
    return jsonify({'units': results[:10]}), 200


# ==========================================
# User Dashboard Summary
# ==========================================
@user_bp.route('/summary', methods=['GET'])
@token_required
def get_user_summary(current_user):
    today = datetime.now().date()
    thirty_days = today + timedelta(days=30)

    active_leases = Lease.query.join(Booking).filter(
        Booking.user_id == current_user.id,
        Lease.status == LeaseStatus.ACTIVE
    ).all()

    active_lease_count = len(active_leases)

    pending_bookings = Booking.query.filter_by(
        user_id=current_user.id,
        status=BookingStatus.PENDING
    ).count()

    open_maintenance = MaintenanceRequest.query.filter(
        MaintenanceRequest.user_id == current_user.id,
        MaintenanceRequest.status.in_([MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS])
    ).count()

    # Find soonest expiring lease
    upcoming_expiry = None
    for lease in active_leases:
        if lease.end_date >= today:
            days_left = (lease.end_date - today).days
            if upcoming_expiry is None or days_left < upcoming_expiry['days_left']:
                upcoming_expiry = {
                    'agreement_id': lease.agreement_id,
                    'end_date': lease.end_date.isoformat(),
                    'days_left': days_left
                }

    return jsonify({
        'active_leases': active_lease_count,
        'pending_bookings': pending_bookings,
        'open_maintenance': open_maintenance,
        'upcoming_expiry': upcoming_expiry
    }), 200


# ==========================================
# Notifications (computed from real data)
# ==========================================
@user_bp.route('/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    today = datetime.now().date()
    notifications = []

    # Approved bookings
    approved_bookings = Booking.query.filter_by(
        user_id=current_user.id, status=BookingStatus.APPROVED
    ).order_by(Booking.created_at.desc()).limit(5).all()
    for b in approved_bookings:
        notifications.append({
            'type': 'booking_approved',
            'title': 'Booking Approved!',
            'message': f'Your booking for Unit {b.unit.unit_number if b.unit else ""} has been approved.',
            'icon': '✅',
            'created_at': b.updated_at.isoformat() if hasattr(b, 'updated_at') and b.updated_at else b.created_at.isoformat()
        })

    # Expiring leases (within 30 days)
    active_leases = Lease.query.join(Booking).filter(
        Booking.user_id == current_user.id,
        Lease.status == LeaseStatus.ACTIVE,
        Lease.end_date >= today,
        Lease.end_date <= today + timedelta(days=30)
    ).all()
    for lease in active_leases:
        days_left = (lease.end_date - today).days
        notifications.append({
            'type': 'lease_expiring',
            'title': 'Lease Expiring Soon',
            'message': f'Agreement {lease.agreement_id} expires in {days_left} day(s).',
            'icon': '⏰',
            'created_at': lease.end_date.isoformat()
        })

    # Resolved maintenance
    resolved = MaintenanceRequest.query.filter(
        MaintenanceRequest.user_id == current_user.id,
        MaintenanceRequest.status == MaintenanceStatus.RESOLVED
    ).order_by(MaintenanceRequest.updated_at.desc()).limit(3).all()
    for req in resolved:
        notifications.append({
            'type': 'maintenance_resolved',
            'title': 'Maintenance Resolved',
            'message': f'Your {req.category} request has been resolved.',
            'icon': '🔧',
            'created_at': req.updated_at.isoformat()
        })

    # Rejected bookings
    rejected = Booking.query.filter_by(
        user_id=current_user.id, status=BookingStatus.REJECTED
    ).order_by(Booking.created_at.desc()).limit(3).all()
    for b in rejected:
        notifications.append({
            'type': 'booking_rejected',
            'title': 'Booking Rejected',
            'message': f'Booking for unit {b.unit.unit_number if b.unit else ""} was rejected.',
            'icon': '❌',
            'created_at': b.updated_at.isoformat() if hasattr(b, 'updated_at') and b.updated_at else b.created_at.isoformat()
        })

    # Sort by date desc
    notifications.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify({'notifications': notifications[:15], 'unread_count': len(notifications)}), 200


# ==========================================
# Booking Management
# ==========================================
@user_bp.route('/bookings', methods=['POST'])
@token_required
def create_booking(current_user):
    data = request.get_json()
    if not data or not data.get('unit_id') or not data.get('move_in_date') or not data.get('lease_duration'):
        return jsonify({'message': 'Missing required booking fields'}), 400

    unit = Unit.query.get(data['unit_id'])
    if not unit or unit.is_deleted:
        return jsonify({'message': 'Unit not found'}), 404

    if unit.status != 'AVAILABLE':
        return jsonify({'message': 'Unit is not available for booking'}), 400

    try:
        move_in_date = datetime.strptime(data['move_in_date'], '%Y-%m-%d').date()
        if move_in_date <= datetime.now().date():
            return jsonify({'message': 'Move in date must be in the future'}), 400
    except ValueError:
        return jsonify({'message': 'Invalid date format, use YYYY-MM-DD'}), 400

    if data['lease_duration'] not in [3, 6, 12, 24]:
        return jsonify({'message': 'Lease duration must be 3, 6, 12, or 24 months'}), 400

    booking = Booking(
        user_id=current_user.id,
        unit_id=unit.id,
        move_in_date=move_in_date,
        lease_duration=data['lease_duration'],
        notes=data.get('notes', '')
    )
    db.session.add(booking)
    db.session.commit()

    return jsonify({'message': 'Booking request submitted. Please wait for admin approval.', 'booking': booking.to_dict()}), 201


@user_bp.route('/bookings/<int:booking_id>/pay-deposit', methods=['POST'])
@token_required
def pay_booking_deposit(current_user, booking_id):
    booking = Booking.query.get(booking_id)
    if not booking or booking.user_id != current_user.id:
        return jsonify({'message': 'Booking not found'}), 404

    if booking.status != BookingStatus.APPROVED:
        return jsonify({'message': 'Booking is not approved for payment'}), 400

    if not booking.approved_at:
        return jsonify({'message': 'Booking approval time missing'}), 500

    # Validate 6-hour window
    time_elapsed = datetime.utcnow() - booking.approved_at
    if time_elapsed > timedelta(hours=6):
        booking.status = BookingStatus.CANCELLED
        # Restore unit status to AVAILABLE
        unit.status = 'AVAILABLE'
        db.session.commit()
        return jsonify({'message': 'Payment window expired. Booking cancelled.'}), 400

    unit = booking.unit
    
    # Process Payments (Security Deposit + First Month's Rent)
    data = request.get_json() or {}
    payment_method = data.get('payment_method', 'PRE-PAID')
    
    # 1. Security Deposit Payment
    ref_id_dep = f"DEP-{booking.id}-{uuid.uuid4().hex[:6].upper()}"
    dep_payment = Payment(
        user_id=current_user.id,
        amount=float(unit.deposit_amount),
        payment_method=payment_method,
        payment_type='DEPOSIT',
        status='SUCCESS',
        reference_id=ref_id_dep,
        notes=f"Initial security deposit for Unit {unit.unit_number}"
    )
    db.session.add(dep_payment)
    
    # 2. First Month's Rent Payment
    ref_id_rent = f"RENT-{booking.id}-{uuid.uuid4().hex[:6].upper()}"
    rent_payment = Payment(
        user_id=current_user.id,
        amount=float(unit.rent_amount),
        payment_method=payment_method,
        payment_type='RENT',
        status='SUCCESS',
        reference_id=ref_id_rent,
        notes=f"First month's rent for Unit {unit.unit_number} (Paid at booking)"
    )
    db.session.add(rent_payment)
    db.session.flush()

    # Create Lease
    start_date = booking.move_in_date
    end_date = start_date + relativedelta(months=booking.lease_duration)
    agreement_id = f"LSE-{uuid.uuid4().hex[:8].upper()}"
    
    lease = Lease(
        booking_id=booking.id,
        start_date=start_date,
        end_date=end_date,
        agreement_id=agreement_id,
    )
    db.session.add(lease)
    db.session.flush()

    # Generate PDF
    try:
        tower = unit.tower
        user = booking.user
        pdf_rel_path = generate_lease_pdf(lease, booking, unit, tower, user)
        lease.pdf_path = pdf_rel_path
    except Exception as e:
        lease.pdf_path = None
        import traceback; traceback.print_exc()

    unit.status = 'LEASED'

    # Auto-reject other pending bookings for the same unit now that deposit is paid
    other_bookings = Booking.query.filter_by(unit_id=unit.id, status=BookingStatus.PENDING).all()
    for ob in other_bookings:
        if ob.id != booking.id:
            ob.status = BookingStatus.REJECTED
            ob.rejection_reason = 'Unit got booked by another user'
            log = ActivityLog(user_id=current_user.id, action='BOOKING_AUTO_REJECTED', entity_type='Booking', entity_id=ob.id)
            db.session.add(log)
    
    booking.status = BookingStatus.BOOKED

    log_lease = ActivityLog(user_id=current_user.id, action='LEASE_GENERATED', entity_type='Lease', entity_id=lease.id)
    db.session.add(log_lease)
    db.session.commit()

    return jsonify({
        'message': 'Initial security deposit and first month\'s rent paid successfully. Lease generated!',
        'lease': lease.to_dict(),
        'deposit_payment': dep_payment.to_dict(),
        'rent_payment': rent_payment.to_dict()
    }), 200


@user_bp.route('/bookings', methods=['GET'])
@token_required
def get_my_bookings(current_user):
    cancel_expired_bookings()
    bookings = Booking.query.filter_by(user_id=current_user.id).order_by(Booking.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookings]), 200


# ==========================================
# Leases
# ==========================================
@user_bp.route('/leases', methods=['GET'])
@token_required
def get_my_leases(current_user):
    leases = Lease.query.join(Booking).filter(Booking.user_id == current_user.id).all()

    results = []
    for lease in leases:
        data = lease.to_dict()
        data['booking'] = lease.booking.to_dict()
        results.append(data)

    return jsonify(results), 200

@user_bp.route('/leases/<int:lease_id>/download', methods=['GET'])
@token_required
def download_lease_pdf_user(current_user, lease_id):
    lease = Lease.query.get(lease_id)
    if not lease: return jsonify({'message': 'Lease not found'}), 404
    if lease.booking.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    if not lease.pdf_path: return jsonify({'message': 'PDF not yet generated for this lease'}), 404
    lease_dir = os.path.abspath(os.path.join('static', 'leases'))
    filename = os.path.basename(lease.pdf_path)
    return send_from_directory(lease_dir, filename, as_attachment=True, download_name=f"{lease.agreement_id}.pdf")



@user_bp.route('/leases/<int:lease_id>/vacate', methods=['POST'])
@token_required
def request_vacate(current_user, lease_id):
    lease = Lease.query.get(lease_id)
    if not lease:
        return jsonify({'message': 'Lease not found'}), 404
        
    if lease.booking.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    if lease.status != LeaseStatus.ACTIVE:
        return jsonify({'message': 'Only ACTIVE leases can request vacate'}), 400
        
    if lease.vacate_request_status == 'PENDING':
        return jsonify({'message': 'Vacate request already pending'}), 400

    data = request.get_json() or {}
    
    lease.vacate_request_status = 'PENDING'
    lease.vacate_request_date = datetime.utcnow()
    lease.vacate_reason = data.get('vacate_reason')
    
    desired_date_str = data.get('desired_vacate_date')
    if desired_date_str:
        try:
            lease.desired_vacate_date = datetime.strptime(desired_date_str, '%Y-%m-%d').date()
        except ValueError:
            pass # Ignore invalid format

    db.session.commit()

    return jsonify({'message': 'Vacate request submitted successfully', 'lease': lease.to_dict()}), 200

# ==========================================
# Maintenance
# ==========================================
@user_bp.route('/maintenance', methods=['POST'])
@token_required
def create_maintenance_request(current_user):
    data = request.get_json()
    if not data or not data.get('unit_id') or not data.get('category') or not data.get('description'):
        return jsonify({'message': 'Missing required fields'}), 400

    unit = Unit.query.get(data['unit_id'])
    if not unit:
        return jsonify({'message': 'Unit not found'}), 404

    # User must have an active lease for this unit
    lease = Lease.query.join(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.unit_id == unit.id,
        Lease.status == LeaseStatus.ACTIVE
    ).first()

    if not lease and unit.status != 'LEASED':
        return jsonify({'message': 'You do not have an active lease for this unit'}), 403

    priority = data.get('priority', 'MEDIUM')
    if priority not in ['LOW', 'MEDIUM', 'HIGH']:
        priority = 'MEDIUM'

    req = MaintenanceRequest(
        user_id=current_user.id,
        unit_id=unit.id,
        category=data['category'],
        description=data['description'],
        image_url=data.get('image_url')
    )
    # Set priority via direct attribute (column added via migration)
    try:
        req.priority = priority
    except Exception:
        pass
    db.session.add(req)
    db.session.commit()

    result = req.to_dict()
    result['priority'] = priority
    return jsonify({'message': 'Maintenance request created', 'request': result}), 201


@user_bp.route('/maintenance', methods=['GET'])
@token_required
def get_my_maintenance_requests(current_user):
    reqs = MaintenanceRequest.query.filter_by(user_id=current_user.id).order_by(MaintenanceRequest.created_at.desc()).all()
    results = []
    for r in reqs:
        d = r.to_dict()
        # Attach priority (might be None if column was just added)
        d['priority'] = getattr(r, 'priority', None) or 'MEDIUM'
        results.append(d)
    return jsonify(results), 200


# ==========================================
# Reviews
# ==========================================
@user_bp.route('/reviews', methods=['POST'])
@token_required
def create_review(current_user):
    data = request.get_json()
    if not data or not data.get('tower_id') or not data.get('rating'):
        return jsonify({'message': 'Missing required fields: tower_id, rating'}), 400

    rating = data.get('rating')
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'message': 'Rating must be an integer between 1 and 5'}), 400

    review = Review(
        user_id=current_user.id,
        tower_id=data.get('tower_id'),
        unit_id=data.get('unit_id'),
        rating=rating,
        comment=data.get('comment', '')
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({'message': 'Review submitted successfully', 'review': review.to_dict()}), 201


@user_bp.route('/towers/<int:tower_id>/reviews', methods=['GET'])
@token_required
def get_tower_reviews(current_user, tower_id):
    reviews = Review.query.filter_by(tower_id=tower_id).order_by(Review.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reviews]), 200


# ==========================================
# Payments
# ==========================================
@user_bp.route('/payments', methods=['GET'])
@token_required
def get_my_payments(current_user):
    payments = Payment.query.filter_by(user_id=current_user.id).order_by(Payment.payment_date.desc()).all()
    return jsonify([p.to_dict() for p in payments]), 200

@user_bp.route('/payments/pay', methods=['POST'])
@token_required
def make_payment(current_user):
    data = request.get_json() or {}
    amount = data.get('amount')
    payment_type = data.get('payment_type', 'RENT')
    payment_method = data.get('payment_method', 'CREDIT_CARD')
    notes = data.get('notes', '')

    if not amount or float(amount) <= 0:
        return jsonify({'message': 'Invalid payment amount'}), 400

    import uuid
    ref_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"

    payment = Payment(
        user_id=current_user.id,
        amount=float(amount),
        payment_method=payment_method,
        payment_type=payment_type,
        status='SUCCESS',  # Simulating a successful transaction
        reference_id=ref_id,
        notes=notes
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({'message': 'Payment successful', 'payment': payment.to_dict()}), 201

@user_bp.route('/payments/dues', methods=['GET'])
@token_required
def get_payment_dues(current_user):
    from sqlalchemy import extract
    from datetime import date
    
    today = date.today()
    
    # Fetch active lease
    active_lease = Lease.query.join(Booking).filter(
        Booking.user_id == current_user.id,
        Lease.status == LeaseStatus.ACTIVE
    ).order_by(Lease.start_date.desc()).first()
    
    if not active_lease:
        return jsonify({'current_due': None, 'upcoming_due': None}), 200

    rent_amount = float(active_lease.booking.unit.rent_amount)
    # Rent due on the 5th
    due_day = 5 
    
    # Check for successful RENT payment in the current month
    current_month_payment = Payment.query.filter(
        Payment.user_id == current_user.id,
        Payment.payment_type == 'RENT',
        Payment.status == 'SUCCESS',
        extract('month', Payment.payment_date) == today.month,
        extract('year', Payment.payment_date) == today.year
    ).first()

    current_due = None
    upcoming_due = None

    if not current_month_payment:
        # Not paid yet this month
        if today.day > due_day:
            # Past due! Apply late fee (fixed 500 or 5% whichever is smaller)
            late_fee = min(500.0, rent_amount * 0.05)
            total_due = rent_amount + late_fee
            current_due = {
                'amount': total_due,
                'base_rent': rent_amount,
                'late_fee': late_fee,
                'due_date': f"{today.year}-{today.month:02d}-{due_day:02d}",
                'status': 'LATE',
                'days_late': today.day - due_day,
                'lease_id': active_lease.id,
                'unit_number': active_lease.booking.unit.unit_number
            }
        else:
            # Upcoming this month
            upcoming_due = {
                'amount': rent_amount,
                'due_date': f"{today.year}-{today.month:02d}-{due_day:02d}",
                'status': 'PENDING',
                'lease_id': active_lease.id,
                'unit_number': active_lease.booking.unit.unit_number
            }
    else:
        # Paid this month, show next month's upcoming
        next_month = today.month + 1 if today.month < 12 else 1
        next_year = today.year if today.month < 12 else today.year + 1
        
        next_due_date = date(next_year, next_month, due_day)
        if next_due_date <= active_lease.end_date:
            upcoming_due = {
                'amount': rent_amount,
                'due_date': next_due_date.isoformat(),
                'status': 'PENDING',
                'lease_id': active_lease.id,
                'unit_number': active_lease.booking.unit.unit_number
            }

    return jsonify({
        'current_due': current_due,
        'upcoming_due': upcoming_due
    }), 200
    

# ==========================================
# Profile Management
# ==========================================
@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
        
    current_user.phone = data.get('phone', current_user.phone)
    current_user.address = data.get('address', current_user.address)
    current_user.city = data.get('city', current_user.city)
    current_user.state = data.get('state', current_user.state)
    current_user.zip_code = data.get('zip_code', current_user.zip_code)
    
    # Optionally allow name update
    current_user.name = data.get('name', current_user.name)
    
    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'user': current_user.to_dict()
    }), 200
