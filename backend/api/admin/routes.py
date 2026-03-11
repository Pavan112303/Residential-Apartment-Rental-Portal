from flask import Blueprint, request, jsonify, send_from_directory
from api.auth.routes import token_required, admin_required
from models.apartment import Tower, Unit, Amenity, AmenityStatus, UnitStatus, FloorLayout, UnitImage
from models.activity import ActivityLog
from extensions import db
from sqlalchemy import text
import os
from lease_pdf import generate_lease_pdf
from cloudinary_helper import upload_image

admin_bp = Blueprint('admin', __name__)

# ==========================================
# Towers Management
# ==========================================
@admin_bp.route('/towers', methods=['POST'])
@token_required
@admin_required
def create_tower(current_user):
    data = request.get_json()
    if not data or not data.get('name') or not data.get('total_floors') or not data.get('flats_per_floor') or not data.get('tower_code'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    tower = Tower(
        name=data['name'], 
        tower_code=data['tower_code'],
        total_floors=data['total_floors'],
        flats_per_floor=data['flats_per_floor'],
        total_units=data['total_floors'] * data['flats_per_floor'],
        description=data.get('description', ''),
        # Location fields
        country=data.get('country', ''),
        state=data.get('state', ''),
        city=data.get('city', ''),
        area=data.get('area', ''),
        pincode=data.get('pincode', ''),
        address_line=data.get('address_line', ''),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
    )
    db.session.add(tower)
    db.session.flush() # get tower.id

    # Auto generate units
    default_flat_type = data.get('default_flat_type', '2BHK')
    default_rent = float(data.get('default_rent', 0.0))
    default_deposit = float(data.get('default_deposit', 0.0))
    default_sqft = float(data.get('default_sqft', 1000.0))

    for floor in range(1, tower.total_floors + 1):
        for flat in range(1, tower.flats_per_floor + 1):
            unit_num = f"{tower.tower_code}-{floor}{flat:02d}"
            unit = Unit(
                tower_id=tower.id,
                floor_number=floor,
                unit_number=unit_num,
                flat_type=default_flat_type,
                rent_amount=default_rent,
                deposit_amount=default_deposit,
                square_feet=default_sqft,
                bathrooms_count=2,
                balcony_count=1,
                status=UnitStatus.AVAILABLE.value
            )
            db.session.add(unit)
    
    # Log activity
    log = ActivityLog(user_id=current_user.id, action='TOWER_CREATED', entity_type='Tower', entity_id=tower.id)
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Tower created and Units auto-generated', 'tower': tower.to_dict()}), 201

@admin_bp.route('/towers', methods=['GET'])
@token_required
@admin_required
def get_towers(current_user):
    towers = Tower.query.all()
    return jsonify([t.to_dict() for t in towers]), 200

@admin_bp.route('/towers/<int:tower_id>', methods=['PUT'])
@token_required
@admin_required
def modify_tower(current_user, tower_id):
    tower = Tower.query.get(tower_id)
    if not tower:
        return jsonify({'message': 'Tower not found'}), 404

    data = request.get_json()
    if 'name' in data:
        tower.name = data['name']
    if 'description' in data:
        tower.description = data['description']
    if 'status' in data:
        allowed = ['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE']
        if data['status'] not in allowed:
            return jsonify({'message': f'Invalid tower status. Must be one of: {allowed}'}), 400
        tower.status = data['status']
    # Location fields
    for field in ['country', 'state', 'city', 'area', 'pincode', 'address_line', 'latitude', 'longitude']:
        if field in data:
            setattr(tower, field, data[field])
        
    db.session.commit()
    return jsonify({'message': 'Tower updated', 'tower': tower.to_dict()}), 200

@admin_bp.route('/towers/<int:tower_id>/image', methods=['POST'])
@token_required
@admin_required
def upload_tower_image(current_user, tower_id):
    tower = Tower.query.get(tower_id)
    if not tower: return jsonify({'message': 'Tower not found'}), 404
    if 'image' not in request.files: return jsonify({'message': 'No image provided'}), 400
    file = request.files['image']
    if file.filename == '': return jsonify({'message': 'No selected file'}), 400
    try:
        url = upload_image(file, 'towers')
        tower.tower_image = url
        db.session.commit()
        return jsonify({'message': 'Tower image uploaded', 'tower': tower.to_dict()}), 200
    except Exception as e:
        return jsonify({'message': 'Image upload failed', 'error': str(e)}), 500

@admin_bp.route('/towers/<int:tower_id>/floor-layout', methods=['POST'])
@token_required
@admin_required
def upload_floor_layout(current_user, tower_id):
    tower = Tower.query.get(tower_id)
    if not tower: return jsonify({'message': 'Tower not found'}), 404
    if 'image' not in request.files: return jsonify({'message': 'No image provided'}), 400
    floor_number = request.form.get('floor_number', type=int)
    if not floor_number: return jsonify({'message': 'No floor_number provided'}), 400
    file = request.files['image']
    if file.filename == '': return jsonify({'message': 'No selected file'}), 400
    try:
        url = upload_image(file, 'layouts')
        layout = FloorLayout(tower_id=tower.id, floor_number=floor_number, image_path=url)
        db.session.add(layout)
        db.session.commit()
        return jsonify({'message': 'Floor layout uploaded', 'layout': layout.to_dict()}), 201
    except Exception as e:
        return jsonify({'message': 'Image upload failed', 'error': str(e)}), 500

@admin_bp.route('/towers/<int:tower_id>/amenities', methods=['POST'])
@token_required
@admin_required
def attach_amenity_to_tower(current_user, tower_id):
    data = request.get_json()
    if not data or not data.get('amenity_ids'):
        return jsonify({'message': 'Missing amenity_ids array'}), 400
        
    tower = Tower.query.get(tower_id)
    if not tower:
        return jsonify({'message': 'Tower not found'}), 404
        
    amenities = Amenity.query.filter(Amenity.id.in_(data['amenity_ids'])).all()
    
    # Initialize the list if it doesn't exist
    if not hasattr(tower, 'amenities'):
        tower.amenities = []
        
    for amenity in amenities:
        if amenity not in tower.amenities:
            tower.amenities.append(amenity)
            
    db.session.commit()
    return jsonify({'message': 'Amenities attached to tower', 'tower': tower.to_dict()}), 200

# ==========================================
# Amenities Management
# ==========================================
@admin_bp.route('/amenities', methods=['POST'])
@token_required
@admin_required
def create_amenity(current_user):
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing name for amenity'}), 400
        
    amenity = Amenity(
        name=data['name'],
        tower_id=data.get('tower_id'),
        status=AmenityStatus(data.get('status', 'OPEN')) if data.get('status') else AmenityStatus.OPEN
    )
    db.session.add(amenity)
    db.session.commit()
    return jsonify({'message': 'Amenity created', 'amenity': amenity.to_dict()}), 201

@admin_bp.route('/amenities/<int:amenity_id>', methods=['PUT', 'DELETE'])
@token_required
@admin_required
def modify_amenity(current_user, amenity_id):
    amenity = Amenity.query.get(amenity_id)
    if not amenity:
        return jsonify({'message': 'Amenity not found'}), 404
        
    if request.method == 'DELETE':
        db.session.delete(amenity)
        db.session.commit()
        return jsonify({'message': 'Amenity deleted'}), 200
        
    data = request.get_json()
    if 'status' in data:
        try:
            amenity.status = AmenityStatus(data['status'])
        except ValueError:
            return jsonify({'message': 'Invalid status'}), 400
            
    db.session.commit()
    return jsonify({'message': 'Amenity updated', 'amenity': amenity.to_dict()}), 200

@admin_bp.route('/amenities', methods=['GET'])
@token_required
@admin_required
def get_amenities(current_user):
    tower_id = request.args.get('tower_id')
    query = Amenity.query
    if tower_id:
        query = query.filter_by(tower_id=tower_id)
    amenities = query.all()
    return jsonify([a.to_dict() for a in amenities]), 200

# ==========================================
# Units Management
# ==========================================
@admin_bp.route('/units', methods=['POST'])
@token_required
@admin_required
def create_unit(current_user):
    data = request.get_json()
    if not data or not data.get('tower_id') or not data.get('unit_number') or not data.get('rent_amount') or not data.get('floor_number') or not data.get('flat_type'):
        return jsonify({'message': 'Missing required fields for unit'}), 400
        
    tower = Tower.query.get(data['tower_id'])
    if not tower:
        return jsonify({'message': 'Tower not found'}), 404
        
    unit = Unit(
        tower_id=tower.id,
        floor_number=data['floor_number'],
        unit_number=data['unit_number'],
        flat_type=data['flat_type'],
        rent_amount=data['rent_amount'],
        deposit_amount=data.get('deposit_amount', 0.0),
        square_feet=data.get('square_feet'),
        facing_direction=data.get('facing_direction'),
        balcony_count=data.get('balcony_count', 0),
        bathrooms_count=data.get('bathrooms_count', 1),
        status='AVAILABLE',
        description=data.get('description', '')
    )
    db.session.add(unit)
    db.session.commit()
    
    log = ActivityLog(user_id=current_user.id, action='UNIT_CREATED', entity_type='Unit', entity_id=unit.id)
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Unit created', 'unit': unit.to_dict()}), 201

@admin_bp.route('/units/<int:unit_id>', methods=['PUT'])
@token_required
@admin_required
def update_unit(current_user, unit_id):
    data = request.get_json()
    unit = Unit.query.get(unit_id)
    if not unit: return jsonify({'message': 'Unit not found'}), 404
    
    if 'flat_type' in data: unit.flat_type = data['flat_type']
    if 'rent_amount' in data: unit.rent_amount = data['rent_amount']
    if 'deposit_amount' in data: unit.deposit_amount = data['deposit_amount']
    if 'square_feet' in data: unit.square_feet = data['square_feet']
    if 'facing_direction' in data: unit.facing_direction = data['facing_direction']
    if 'balcony_count' in data: unit.balcony_count = data['balcony_count']
    if 'bathrooms_count' in data: unit.bathrooms_count = data['bathrooms_count']
    if 'description' in data: unit.description = data['description']
    if 'status' in data:
        allowed_statuses = ['AVAILABLE', 'BOOKED', 'LEASED', 'UNDER_MAINTENANCE', 'BLOCKED', 'LOCKED']
        if data['status'] in allowed_statuses:
            unit.status = data['status']
            
    db.session.commit()
    return jsonify({'message': 'Unit updated', 'unit': unit.to_dict()}), 200

@admin_bp.route('/units/<int:unit_id>/images', methods=['POST'])
@token_required
@admin_required
def upload_unit_image(current_user, unit_id):
    unit = Unit.query.get(unit_id)
    if not unit: return jsonify({'message': 'Unit not found'}), 404
    if 'images' not in request.files: return jsonify({'message': 'No images provided'}), 400

    files = request.files.getlist('images')
    if len(files) == 0 or (len(files) == 1 and files[0].filename == ''):
        return jsonify({'message': 'No selected files'}), 400

    uploaded_images = []
    try:
        for file in files:
            if file.filename:
                url = upload_image(file, 'units')
                u_image = UnitImage(unit_id=unit.id, image_path=url)
                db.session.add(u_image)
                db.session.flush()
                uploaded_images.append(u_image)
        db.session.commit()
        return jsonify({'message': f'{len(uploaded_images)} images uploaded', 'unit': unit.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Image upload failed', 'error': str(e)}), 500

@admin_bp.route('/units/<int:unit_id>/amenities', methods=['POST'])
@token_required
@admin_required
def attach_amenity_to_unit(current_user, unit_id):
    data = request.get_json()
    if not data or not data.get('amenity_ids'):
        return jsonify({'message': 'Missing amenity_ids array'}), 400
        
    unit = Unit.query.get(unit_id)
    if not unit:
        return jsonify({'message': 'Unit not found'}), 404
        
    amenities = Amenity.query.filter(Amenity.id.in_(data['amenity_ids'])).all()
    for amenity in amenities:
        if amenity not in unit.amenities:
            unit.amenities.append(amenity)
            
    db.session.commit()
    return jsonify({'message': 'Amenities attached to unit', 'unit': unit.to_dict()}), 200

@admin_bp.route('/units', methods=['GET'])
@token_required
@admin_required
def get_all_units(current_user):
    # Support filtering for admin dashboard
    tower_code = request.args.get('towerCode')
    
    query = Unit.query.join(Tower).filter(
        Unit.is_deleted == False,
        Tower.status == 'ACTIVE'
    )
    
    if tower_code:
        query = query.filter(Tower.tower_code == tower_code)
        
    units = query.all()
    return jsonify([u.to_dict() for u in units]), 200

# ==========================================
# Bookings Management & Approval Workflow
# ==========================================
from models.booking import Booking, BookingStatus
from models.lease import Lease, LeaseStatus
from datetime import datetime
from dateutil.relativedelta import relativedelta
import uuid
import os

@admin_bp.route('/bookings', methods=['GET'])
@token_required
@admin_required
def get_all_bookings(current_user):
    status = request.args.get('status')
    query = Booking.query
    if status:
        query = query.filter_by(status=status)
    bookings = query.all()
    return jsonify([b.to_dict() for b in bookings]), 200

@admin_bp.route('/bookings/<int:booking_id>/approve', methods=['POST'])
@token_required
@admin_required
def approve_booking(current_user, booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
        
    if booking.status != BookingStatus.PENDING:
        return jsonify({'message': 'Booking is not pending'}), 400
        
    unit = booking.unit
    if unit.status != 'AVAILABLE':
        return jsonify({'message': 'Unit is no longer available'}), 400
        
    # 1. Approve this booking and start the 6-hour payment timer
    booking.status = BookingStatus.APPROVED
    booking.approved_at = datetime.utcnow()
    
    # Update unit status to 'LOCKED' to prevent others from booking it
    unit.status = 'LOCKED'
    
    # 5. Log action
    log_approve = ActivityLog(user_id=current_user.id, action='BOOKING_APPROVED', entity_type='Booking', entity_id=booking.id)
    db.session.add(log_approve)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Booking approved! User has 6 hours to pay the deposit.',
        'booking': booking.to_dict()
    }), 200

@admin_bp.route('/bookings/<int:booking_id>/reject', methods=['POST'])
@token_required
@admin_required
def reject_booking(current_user, booking_id):
    data = request.get_json() or {}
    reason = data.get('reason', 'No reason provided')
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
        
    if booking.status != BookingStatus.PENDING:
        return jsonify({'message': 'Can only reject pending bookings'}), 400
        
    booking.status = BookingStatus.REJECTED
    booking.rejection_reason = reason
    
    log = ActivityLog(user_id=current_user.id, action='BOOKING_REJECTED', entity_type='Booking', entity_id=booking.id)
    db.session.add(log)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Booking rejected',
        'booking': booking.to_dict()
    }), 200

@admin_bp.route('/leases', methods=['GET'])
@token_required
@admin_required
def get_all_leases(current_user):
    status = request.args.get('status')
    query = Lease.query
    if status:
        try:
            query = query.filter_by(status=LeaseStatus(status))
        except ValueError:
            pass
    leases = query.all()
    return jsonify([l.to_dict() for l in leases]), 200

@admin_bp.route('/leases/<int:lease_id>/cancel', methods=['POST'])
@token_required
@admin_required
def cancel_lease(current_user, lease_id):
    lease = Lease.query.get(lease_id)
    if not lease: return jsonify({'message': 'Lease not found'}), 404
    
    try:
        lease.status = LeaseStatus.CANCELLED
        unit = lease.booking.unit
        unit.status = 'AVAILABLE'
        
        log = ActivityLog(user_id=current_user.id, action='LEASE_CANCELLED', entity_type='Lease', entity_id=lease.id)
        db.session.add(log)
        db.session.commit()
        return jsonify({'message': 'Lease cancelled', 'lease': lease.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to cancel lease', 'error': str(e)}), 500

@admin_bp.route('/leases/<int:lease_id>/regenerate-pdf', methods=['POST'])
@token_required
@admin_required
def regenerate_lease_pdf(current_user, lease_id):
    """Re-generate the PDF for an existing lease (e.g. after status change for watermark)."""
    lease = Lease.query.get(lease_id)
    if not lease: return jsonify({'message': 'Lease not found'}), 404
    try:
        booking = lease.booking
        unit = booking.unit
        tower = unit.tower
        user = booking.user
        pdf_rel_path = generate_lease_pdf(lease, booking, unit, tower, user)
        lease.pdf_path = pdf_rel_path
        db.session.commit()
        return jsonify({'message': 'PDF regenerated', 'pdf_path': pdf_rel_path, 'lease': lease.to_dict()}), 200
    except Exception as e:
        return jsonify({'message': 'PDF generation failed', 'error': str(e)}), 500


@admin_bp.route('/leases/<int:lease_id>/download', methods=['GET'])
@token_required
@admin_required
def download_lease_pdf_admin(current_user, lease_id):
    """Serve lease PDF file for download (admin)."""
    lease = Lease.query.get(lease_id)
    if not lease: return jsonify({'message': 'Lease not found'}), 404
    if not lease.pdf_path: return jsonify({'message': 'No PDF available for this lease'}), 404
    lease_dir = os.path.abspath(os.path.join('static', 'leases'))
    filename = os.path.basename(lease.pdf_path)
    return send_from_directory(lease_dir, filename, as_attachment=True, download_name=f"{lease.agreement_id}.pdf")


@admin_bp.route('/leases/<int:lease_id>/terminate', methods=['POST'])
@token_required
@admin_required
def terminate_lease(current_user, lease_id):
    data = request.get_json() or {}
    reason = data.get('reason', 'Terminated by admin')
    
    lease = Lease.query.get(lease_id)
    if not lease: return jsonify({'message': 'Lease not found'}), 404
    if lease.status != LeaseStatus.ACTIVE:
        return jsonify({'message': 'Only ACTIVE leases can be terminated'}), 400
    
    try:
        lease.status = LeaseStatus.CANCELLED
        lease.termination_reason = reason
        unit = lease.booking.unit
        unit.status = 'AVAILABLE'
        
        log = ActivityLog(user_id=current_user.id, action='LEASE_TERMINATED', entity_type='Lease', entity_id=lease.id)
        db.session.add(log)
        db.session.commit()
        return jsonify({'message': 'Lease terminated', 'lease': lease.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to terminate lease', 'error': str(e)}), 500


@admin_bp.route('/leases/<int:lease_id>/vacate/approve', methods=['POST'])
@token_required
@admin_required
def approve_vacate(current_user, lease_id):
    lease = Lease.query.get(lease_id)
    if not lease: return jsonify({'message': 'Lease not found'}), 404
    if lease.vacate_request_status != 'PENDING':
        return jsonify({'message': 'No pending vacate request found'}), 400

    try:
        lease.vacate_request_status = 'APPROVED'
        lease.status = LeaseStatus.COMPLETED
        unit = lease.booking.unit
        unit.status = 'AVAILABLE'
        
        log = ActivityLog(user_id=current_user.id, action='VACATE_APPROVED', entity_type='Lease', entity_id=lease.id)
        db.session.add(log)
        db.session.commit()
        return jsonify({'message': 'Vacate request approved. Lease completed.', 'lease': lease.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to approve vacate request', 'error': str(e)}), 500


@admin_bp.route('/leases/<int:lease_id>/vacate/reject', methods=['POST'])
@token_required
@admin_required
def reject_vacate(current_user, lease_id):
    lease = Lease.query.get(lease_id)
    if not lease: return jsonify({'message': 'Lease not found'}), 404
    if lease.vacate_request_status != 'PENDING':
        return jsonify({'message': 'No pending vacate request found'}), 400

    try:
        lease.vacate_request_status = 'REJECTED'
        
        log = ActivityLog(user_id=current_user.id, action='VACATE_REJECTED', entity_type='Lease', entity_id=lease.id)
        db.session.add(log)
        db.session.commit()
        return jsonify({'message': 'Vacate request rejected', 'lease': lease.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to reject vacate request', 'error': str(e)}), 500


# ==========================================
# Payments
# ==========================================
@admin_bp.route('/payments', methods=['GET'])
@token_required
@admin_required
def get_all_payments(current_user):
    """Retrieve all payments across the platform."""
    payments = Payment.query.order_by(Payment.payment_date.desc()).limit(200).all()
    return jsonify([p.to_dict() for p in payments]), 200


@admin_bp.route('/leases/<int:lease_id>/extend', methods=['POST'])
@token_required
@admin_required
def extend_lease(current_user, lease_id):
    data = request.get_json() or {}
    months = int(data.get('months', 1))
    if months < 1 or months > 24:
        return jsonify({'message': 'Extension must be 1-24 months'}), 400
    
    lease = Lease.query.get(lease_id)
    if not lease: return jsonify({'message': 'Lease not found'}), 404
    if lease.status != LeaseStatus.ACTIVE:
        return jsonify({'message': 'Only ACTIVE leases can be extended'}), 400
    
    try:
        lease.end_date = lease.end_date + relativedelta(months=months)
        log = ActivityLog(user_id=current_user.id, action='LEASE_EXTENDED', entity_type='Lease', entity_id=lease.id)
        db.session.add(log)
        db.session.commit()
        return jsonify({'message': f'Lease extended by {months} month(s)', 'lease': lease.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to extend lease', 'error': str(e)}), 500


@admin_bp.route('/bookings/<int:booking_id>', methods=['GET'])
@token_required
@admin_required
def get_booking_detail(current_user, booking_id):
    booking = Booking.query.get(booking_id)
    if not booking: return jsonify({'message': 'Booking not found'}), 404
    return jsonify(booking.to_dict()), 200


@admin_bp.route('/units/<int:unit_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_unit(current_user, unit_id):
    unit = Unit.query.get(unit_id)
    if not unit: return jsonify({'message': 'Unit not found'}), 404
    if unit.is_deleted: return jsonify({'message': 'Unit already deleted'}), 400

    # Guard: no active lease
    active_lease = db.session.query(Lease).join(Booking, Booking.id == Lease.booking_id).filter(
        Booking.unit_id == unit_id, Lease.status == LeaseStatus.ACTIVE
    ).first()
    if active_lease:
        return jsonify({'message': 'Cannot delete unit with an active lease'}), 400

    # Guard: no pending booking
    pending_booking = Booking.query.filter_by(unit_id=unit_id, status=BookingStatus.PENDING).first()
    if pending_booking:
        return jsonify({'message': 'Cannot delete unit with a pending booking. Reject the booking first.'}), 400

    unit.is_deleted = True
    db.session.execute(
        text('UPDATE units SET status=\'BLOCKED\', is_deleted=true WHERE id=:id'),
        {'id': unit_id}
    )
    log = ActivityLog(user_id=current_user.id, action='UNIT_DELETED', entity_type='Unit', entity_id=unit.id)
    db.session.add(log)
    db.session.commit()
    # Refresh to reflect raw SQL change
    db.session.expire(unit)
    return jsonify({'message': 'Unit soft-deleted successfully'}), 200


@admin_bp.route('/units/<int:unit_id>/maintenance', methods=['POST'])
@token_required
@admin_required
def set_unit_maintenance(current_user, unit_id):
    data = request.get_json() or {}
    enable = data.get('enable', True)

    unit = Unit.query.get(unit_id)
    if not unit: return jsonify({'message': 'Unit not found'}), 404

    if enable:
        # Check no active lease
        active_lease = db.session.query(Lease).join(Booking, Booking.id == Lease.booking_id).filter(
            Booking.unit_id == unit_id, Lease.status == LeaseStatus.ACTIVE
        ).first()
        if active_lease:
            return jsonify({'message': 'Cannot set under maintenance: unit has an active lease'}), 400

        unit.status = 'UNDER_MAINTENANCE'
        # Auto-cancel pending bookings
        pending_bookings = Booking.query.filter_by(unit_id=unit_id, status=BookingStatus.PENDING).all()
        for b in pending_bookings:
            b.status = BookingStatus.REJECTED
            b.rejection_reason = 'Unit placed under maintenance by admin'
            log = ActivityLog(user_id=current_user.id, action='BOOKING_AUTO_REJECTED', entity_type='Booking', entity_id=b.id)
            db.session.add(log)
        log = ActivityLog(user_id=current_user.id, action='UNIT_MAINTENANCE_ON', entity_type='Unit', entity_id=unit.id)
    else:
        unit.status = 'AVAILABLE'
        log = ActivityLog(user_id=current_user.id, action='UNIT_MAINTENANCE_OFF', entity_type='Unit', entity_id=unit.id)

    db.session.add(log)
    db.session.commit()
    return jsonify({'message': f'Unit maintenance {"enabled" if enable else "disabled"}', 'unit': unit.to_dict()}), 200


@admin_bp.route('/towers/<int:tower_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_tower(current_user, tower_id):
    tower = Tower.query.get(tower_id)
    if not tower: return jsonify({'message': 'Tower not found'}), 404

    # Guard: no active leases in this tower
    active_count = db.session.query(Lease).join(Booking, Booking.id == Lease.booking_id).join(
        Unit, Unit.id == Booking.unit_id
    ).filter(Unit.tower_id == tower_id, Lease.status == LeaseStatus.ACTIVE).count()
    if active_count > 0:
        return jsonify({'message': f'Cannot delete tower: {active_count} active lease(s) exist'}), 400

    # Soft delete: mark all units as deleted via raw SQL to bypass ORM enum adapter
    db.session.execute(
        text('UPDATE units SET status=\'BLOCKED\', is_deleted=true WHERE tower_id=:tid'),
        {'tid': tower_id}
    )
    tower.status = 'INACTIVE'
    log = ActivityLog(user_id=current_user.id, action='TOWER_DELETED', entity_type='Tower', entity_id=tower.id)
    db.session.add(log)
    db.session.commit()
    return jsonify({'message': 'Tower soft-deleted (marked INACTIVE)'}), 200



# ==========================================
# Maintenance Management
# ==========================================
from models.maintenance import MaintenanceRequest, MaintenanceStatus

@admin_bp.route('/maintenance', methods=['GET'])
@token_required
@admin_required
def get_all_maintenance_requests(current_user):
    status = request.args.get('status')
    query = MaintenanceRequest.query
    if status:
        query = query.filter_by(status=status)
    requests = query.all()
    return jsonify([r.to_dict() for r in requests]), 200

@admin_bp.route('/maintenance/<int:req_id>', methods=['PUT'])
@token_required
@admin_required
def update_maintenance_request(current_user, req_id):
    data = request.get_json()
    req = MaintenanceRequest.query.get(req_id)
    if not req:
        return jsonify({'message': 'Request not found'}), 404
        
    if data.get('status'):
        try:
            req.status = MaintenanceStatus(data['status'])
        except ValueError:
            return jsonify({'message': 'Invalid status'}), 400
            
    if data.get('admin_comment') is not None:
        req.admin_comment = data['admin_comment']
        
    db.session.commit()
    return jsonify({'message': 'Maintenance request updated', 'request': req.to_dict()}), 200

# ==========================================
# Analytics & Expiry Handling
# ==========================================
from sqlalchemy import func, and_
from datetime import timedelta

@admin_bp.route('/analytics/summary', methods=['GET'])
@token_required
@admin_required
def get_analytics_summary(current_user):
    total_towers = Tower.query.count()
    total_units = Unit.query.filter_by(is_deleted=False).count()
    available_units = Unit.query.filter_by(status='AVAILABLE', is_deleted=False).count()
    booked_units = Unit.query.filter_by(status='BOOKED', is_deleted=False).count()
    leased_units = Unit.query.filter_by(status='LEASED', is_deleted=False).count()
    occupancy_rate = (leased_units / total_units * 100) if total_units > 0 else 0
    active_leases_count = Lease.query.filter_by(status=LeaseStatus.ACTIVE).count()
    pending_bookings = Booking.query.filter_by(status=BookingStatus.PENDING).count()
    open_maintenance = MaintenanceRequest.query.filter(
        MaintenanceRequest.status.in_([MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS])
    ).count()

    # Revenue from ACTIVE leases via booking→unit join
    active_lease_units = db.session.query(Unit).join(
        Booking, Booking.unit_id == Unit.id
    ).join(
        Lease, Lease.booking_id == Booking.id
    ).filter(Lease.status == LeaseStatus.ACTIVE).all()
    monthly_revenue = sum(u.rent_amount for u in active_lease_units)
    total_deposits = sum(u.deposit_amount for u in active_lease_units)

    today = datetime.now().date()
    thirty_days = today + timedelta(days=30)
    leases_expiring_30d = Lease.query.filter(
        Lease.status == LeaseStatus.ACTIVE,
        Lease.end_date >= today,
        Lease.end_date <= thirty_days
    ).count()

    return jsonify({
        'total_towers': total_towers,
        'total_units': total_units,
        'available_units': available_units,
        'booked_units': booked_units,
        'leased_units': leased_units,
        'occupancy_percentage': round(occupancy_rate, 2),
        'active_leases': active_leases_count,
        'pending_bookings': pending_bookings,
        'open_maintenance': open_maintenance,
        'monthly_revenue_estimation': monthly_revenue,
        'annual_revenue_projection': monthly_revenue * 12,
        'total_deposits_held': total_deposits,
        'leases_expiring_30d': leases_expiring_30d
    }), 200


@admin_bp.route('/analytics/dashboard', methods=['GET'])
@token_required
@admin_required
def get_dashboard(current_user):
    today = datetime.now().date()
    thirty_days = today + timedelta(days=30)

    # --- Core Metrics ---
    total_towers = Tower.query.count()
    active_towers = Tower.query.filter_by(status='ACTIVE').count()
    base_unit_query = Unit.query.join(Tower).filter(
        Unit.is_deleted == False,
        Tower.status == 'ACTIVE'
    )
    total_units = base_unit_query.count()
    available_units = base_unit_query.filter(Unit.status == 'AVAILABLE').count()
    booked_units = base_unit_query.filter(Unit.status == 'BOOKED').count()
    leased_units = base_unit_query.filter(Unit.status == 'LEASED').count()
    occupancy_rate = round((leased_units / total_units * 100), 2) if total_units > 0 else 0
    active_leases_count = Lease.query.filter_by(status=LeaseStatus.ACTIVE).count()
    pending_bookings_count = Booking.query.filter_by(status=BookingStatus.PENDING).count()
    open_maintenance_count = MaintenanceRequest.query.filter(
        MaintenanceRequest.status.in_([MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS])
    ).count()

    # --- Revenue ---
    active_lease_units = db.session.query(Unit).join(
        Booking, Booking.unit_id == Unit.id
    ).join(
        Lease, Lease.booking_id == Booking.id
    ).filter(Lease.status == LeaseStatus.ACTIVE).all()
    monthly_revenue = sum(u.rent_amount for u in active_lease_units)
    total_deposits = sum(u.deposit_amount for u in active_lease_units)

    # --- Alerts ---
    alerts = []

    # Leases expiring in 30 days
    expiring_leases = Lease.query.filter(
        Lease.status == LeaseStatus.ACTIVE,
        Lease.end_date >= today,
        Lease.end_date <= thirty_days
    ).all()
    if expiring_leases:
        alerts.append({
            'type': 'expiry',
            'severity': 'red',
            'message': f'{len(expiring_leases)} lease(s) expiring within 30 days',
            'link': 'leases'
        })

    # Pending bookings
    if pending_bookings_count > 0:
        alerts.append({
            'type': 'pending',
            'severity': 'yellow',
            'message': f'{pending_bookings_count} booking(s) awaiting approval',
            'link': 'bookings'
        })

    # Open maintenance
    if open_maintenance_count > 0:
        alerts.append({
            'type': 'maintenance',
            'severity': 'orange',
            'message': f'{open_maintenance_count} open maintenance request(s)',
            'link': 'maintenance'
        })

    # BOOKED units with no active lease (possible admin oversight)
    booked_units_list = Unit.query.filter_by(status='BOOKED', is_deleted=False).all()
    orphan_bookings = []
    for u in booked_units_list:
        has_active_lease = any(
            b.lease and b.lease.status == LeaseStatus.ACTIVE
            for b in u.bookings
        )
        if not has_active_lease:
            orphan_bookings.append(u.unit_number)
    if orphan_bookings:
        alerts.append({
            'type': 'orphan',
            'severity': 'orange',
            'message': f'{len(orphan_bookings)} unit(s) marked BOOKED but no active lease',
            'link': 'units'
        })

    # Towers with no units
    all_towers = Tower.query.all()
    empty_towers = [t.name for t in all_towers if t.status == 'ACTIVE' and Unit.query.filter_by(tower_id=t.id, is_deleted=False).count() == 0]
    if empty_towers:
        alerts.append({
            'type': 'empty_tower',
            'severity': 'yellow',
            'message': f'{len(empty_towers)} tower(s) have no units configured',
            'link': 'towers'
        })

    # --- Booking Trend (last 6 months, SQLite-compatible) ---
    booking_trend = []
    for i in range(5, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1)
        count = Booking.query.filter(
            Booking.created_at >= datetime.combine(month_start, datetime.min.time()),
            Booking.created_at < datetime.combine(month_end, datetime.min.time())
        ).count()
        booking_trend.append({
            'month': month_start.strftime('%b %Y'),
            'count': count
        })

    # --- Revenue Trend (last 6 months) ---
    revenue_trend = []
    for i in range(5, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1)
        # Active leases during this month
        month_leases = db.session.query(Unit).join(
            Booking, Booking.unit_id == Unit.id
        ).join(
            Lease, Lease.booking_id == Booking.id
        ).filter(
            Lease.status == LeaseStatus.ACTIVE,
            Lease.start_date <= month_end,
            Lease.end_date >= month_start
        ).all()
        revenue_trend.append({
            'month': month_start.strftime('%b %Y'),
            'revenue': sum(u.rent_amount for u in month_leases)
        })

    # --- Expiring Leases Detail ---
    expiring_leases_detail = []
    for lease in expiring_leases:
        unit = lease.booking.unit if lease.booking else None
        tenant = lease.booking.user if lease.booking else None
        days_left = (lease.end_date - today).days
        expiring_leases_detail.append({
            'agreement_id': lease.agreement_id,
            'unit_number': unit.unit_number if unit else 'N/A',
            'tower_name': unit.tower.name if unit and unit.tower else 'N/A',
            'tenant_name': tenant.name if tenant else 'N/A',
            'end_date': lease.end_date.isoformat(),
            'days_left': days_left
        })

    # --- Tower Breakdown ---
    tower_breakdown = []
    for tower in all_towers:
        t_units = Unit.query.filter_by(tower_id=tower.id, is_deleted=False).all()
        t_total = len(t_units)
        t_avail = sum(1 for u in t_units if u.status == 'AVAILABLE')
        t_booked = sum(1 for u in t_units if u.status == 'BOOKED')
        t_leased = sum(1 for u in t_units if u.status == 'LEASED')
        t_occ = round((t_leased / t_total * 100), 1) if t_total > 0 else 0

        # Revenue from active leases for this tower
        t_revenue_units = db.session.query(Unit).join(
            Booking, Booking.unit_id == Unit.id
        ).join(
            Lease, Lease.booking_id == Booking.id
        ).filter(
            Unit.tower_id == tower.id,
            Lease.status == LeaseStatus.ACTIVE
        ).all()
        t_revenue = sum(u.rent_amount for u in t_revenue_units)

        tower_breakdown.append({
            'id': tower.id,
            'name': tower.name,
            'tower_code': tower.tower_code,
            'total_units': t_total,
            'available': t_avail,
            'booked': t_booked,
            'leased': t_leased,
            'occupancy_pct': t_occ,
            'monthly_revenue': t_revenue
        })

    return jsonify({
        # Summary metrics
        'total_towers': total_towers,
        'active_towers': active_towers,
        'total_units': total_units,
        'available_units': available_units,
        'booked_units': booked_units,
        'leased_units': leased_units,
        'occupancy_percentage': occupancy_rate,
        'active_leases': active_leases_count,
        'pending_bookings': pending_bookings_count,
        'open_maintenance': open_maintenance_count,
        'monthly_revenue': monthly_revenue,
        'annual_revenue_projection': monthly_revenue * 12,
        'total_deposits': total_deposits,
        'leases_expiring_30d': len(expiring_leases),
        # Structured data
        'alerts': alerts,
        'occupancy_chart': {
            'available': available_units,
            'booked': booked_units,
            'leased': leased_units
        },
        'booking_trend': booking_trend,
        'revenue_trend': revenue_trend,
        'expiring_leases': expiring_leases_detail,
        'tower_breakdown': tower_breakdown
    }), 200


@admin_bp.route('/analytics/bookings-trend', methods=['GET'])
@token_required
@admin_required
def get_bookings_trend(current_user):
    today = datetime.now().date()
    booking_trend = []
    for i in range(5, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1)
        count = Booking.query.filter(
            Booking.created_at >= datetime.combine(month_start, datetime.min.time()),
            Booking.created_at < datetime.combine(month_end, datetime.min.time())
        ).count()
        booking_trend.append({'month': month_start.strftime('%Y-%m'), 'count': count})
    return jsonify(booking_trend), 200

@admin_bp.route('/system/process-expiries', methods=['POST'])
@token_required
@admin_required
def process_lease_expiries(current_user):
    today = datetime.now().date()
    
    # Find all active leases that have ended
    expired_leases = Lease.query.filter(Lease.end_date < today, Lease.status == LeaseStatus.ACTIVE).all()
    processed_count = 0
    
    for lease in expired_leases:
        lease.status = LeaseStatus.COMPLETED
        unit = lease.booking.unit
        unit.status = UnitStatus.AVAILABLE
        
        log = ActivityLog(user_id=current_user.id, action='LEASE_EXPIRED', entity_type='Lease', entity_id=lease.id)
        db.session.add(log)
        processed_count += 1
        
    db.session.commit()
    
    return jsonify({
        'message': f'Processed {processed_count} expired leases.',
        'processed_count': processed_count
    }), 200

# ==========================================
# Audit & Login Tracking
# ==========================================
from models.user import UserLoginAudit, User
from models.lease import Lease, LeaseStatus
from models.booking import Booking
from models.maintenance import MaintenanceRequest, MaintenanceStatus
from models.payment import Payment
from models.review import Review
# from extensions import dbMaintenanceRequest # This line was in the instruction snippet but seems incorrect, assuming 'db' is already imported from 'extensions' or similar.

@admin_bp.route('/audit/logins', methods=['GET'])
@token_required
@admin_required
def get_audit_logins(current_user):
    from datetime import datetime
    
    # One-time backfill of legacy active users if the audit table is completely empty
    existing = UserLoginAudit.query.first()
    if not existing:
        users = User.query.all()
        for user in users:
            audit = UserLoginAudit(
                user_id=user.id,
                email=user.email,
                login_status='SUCCESS',
                ip_address='system_backfill',
                device_info='Historical backfill for existing user',
                login_time=user.created_at,
                created_at=user.created_at
            )
            db.session.add(audit)
        db.session.commit()

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status_q = request.args.get('status', 'ALL')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    tower_code = request.args.get('tower_code', '')

    query = UserLoginAudit.query
    if tower_code:
        from models.apartment import Unit, Tower
        query = query.join(User, UserLoginAudit.user_id == User.id)\
                     .join(Booking, User.id == Booking.user_id)\
                     .join(Lease, Booking.id == Lease.booking_id)\
                     .join(Unit, Booking.unit_id == Unit.id)\
                     .join(Tower, Unit.tower_id == Tower.id)\
                     .filter(Tower.tower_code == tower_code, Lease.status == LeaseStatus.ACTIVE)

    if status_q != 'ALL':
        query = query.filter(UserLoginAudit.login_status == status_q)
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(UserLoginAudit.created_at >= start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(UserLoginAudit.created_at <= end_dt)
        except ValueError:
            pass

    pagination = query.order_by(UserLoginAudit.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    
    # We want to attach user roles and names if possible
    result = []
    for log in pagination.items:
        log_data = log.to_dict()
        user = User.query.get(log.user_id) if log.user_id else None
        
        log_data['user_name'] = user.name if user else 'Unknown'
        log_data['user_role'] = user.role.value if user else 'SYSTEM'
        
        result.append(log_data)
        
    return jsonify({
        'data': result,
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200

@admin_bp.route('/audit/user/<int:user_id>', methods=['GET'])
@token_required
@admin_required
def get_audit_user_details(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    user_data = user.to_dict()
    
    # Fetch active lease
    active_lease = Lease.query.join(Booking).filter(Booking.user_id == user.id, Lease.status == LeaseStatus.ACTIVE).first()
    
    lease_data = None
    if active_lease:
        unit = active_lease.booking.unit
        tower = unit.tower
        lease_data = {
            'lease_id': active_lease.id,
            'start_date': active_lease.start_date.isoformat() if active_lease.start_date else None,
            'end_date': active_lease.end_date.isoformat() if active_lease.end_date else None,
            'status': active_lease.status.value,
            'unit_number': unit.unit_number,
            'tower_name': tower.name,
            'tower_code': tower.tower_code,
            'flat_type': unit.flat_type
        }
        
    # Fetch booking history
    bookings = Booking.query.filter_by(user_id=user.id).all()
    
    # Fetch maintenance history
    maintenance_reqs = MaintenanceRequest.query.filter_by(user_id=user.id).order_by(MaintenanceRequest.created_at.desc()).all()
    
    user_data.update({
        'current_lease': lease_data,
        'total_bookings': len(bookings),
        'maintenance_requests': [req.to_dict() for req in maintenance_reqs]
    })
    
    return jsonify(user_data), 200
