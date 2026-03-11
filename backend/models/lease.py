from extensions import db
from datetime import datetime, date
import enum

class LeaseStatus(enum.Enum):
    ACTIVE = 'ACTIVE'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'

class Lease(db.Model):
    __tablename__ = 'leases'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    agreement_id = db.Column(db.String(50), unique=True, nullable=False)
    status = db.Column(db.Enum(LeaseStatus), default=LeaseStatus.ACTIVE, nullable=False)
    pdf_path = db.Column(db.String(255))
    termination_reason = db.Column(db.Text, nullable=True)
    
    # Vacate Tracking
    vacate_request_status = db.Column(db.String(20), nullable=True) # PENDING, APPROVED, REJECTED
    vacate_request_date = db.Column(db.DateTime, nullable=True)
    vacate_reason = db.Column(db.Text, nullable=True)
    desired_vacate_date = db.Column(db.Date, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    booking = db.relationship('Booking', backref=db.backref('lease', uselist=False, lazy=True))

    def computed_status(self):
        """Returns display status: ACTIVE, EXPIRING (≤30d), EXPIRED, CANCELLED, COMPLETED"""
        if self.status == LeaseStatus.CANCELLED:
            return 'CANCELLED'
        if self.status == LeaseStatus.COMPLETED:
            return 'COMPLETED'
        today = date.today()
        if self.end_date < today:
            return 'EXPIRED'
        days_left = (self.end_date - today).days
        if days_left <= 30:
            return 'EXPIRING'
        return 'ACTIVE'

    def days_remaining(self):
        today = date.today()
        delta = (self.end_date - today).days
        return delta

    def duration_days(self):
        return (self.end_date - self.start_date).days

    def to_dict(self):
        unit = self.booking.unit if self.booking else None
        user = self.booking.user if self.booking else None
        tower = unit.tower if unit else None
        today = date.today()
        total_days = self.duration_days()
        elapsed = (today - self.start_date).days if self.start_date else 0
        progress_pct = min(100, round((elapsed / total_days * 100) if total_days > 0 else 0, 1))

        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'agreement_id': self.agreement_id,
            'status': self.status.value,
            'computed_status': self.computed_status(),
            'days_remaining': self.days_remaining(),
            'progress_pct': progress_pct,
            'pdf_path': self.pdf_path,
            'termination_reason': self.termination_reason,
            # Tenant info
            'tenant_id': user.id if user else None,
            'tenant_name': user.name if user else None,
            'tenant_email': user.email if user else None,
            'tenant_phone': user.phone if user else None,
            'tenant_address': user.address if user else None,
            'tenant_city': user.city if user else None,
            'tenant_state': user.state if user else None,
            'tenant_zip_code': user.zip_code if user else None,
            # Unit info
            'unit_id': unit.id if unit else None,
            'unit_number': unit.unit_number if unit else None,
            'flat_type': unit.flat_type if unit else None,
            'rent_amount': unit.rent_amount if unit else None,
            'deposit_amount': unit.deposit_amount if unit else None,
            # Tower info
            'tower_id': tower.id if tower else None,
            'tower_name': tower.name if tower else None,
            'tower_code': tower.tower_code if tower else None,
            # Booking details
            'booking': self.booking.to_dict() if self.booking else None,
            'vacate_request_status': self.vacate_request_status,
            'vacate_request_date': self.vacate_request_date.isoformat() if self.vacate_request_date else None,
            'vacate_reason': self.vacate_reason,
            'desired_vacate_date': self.desired_vacate_date.isoformat() if self.desired_vacate_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
