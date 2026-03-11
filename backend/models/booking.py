from extensions import db
from datetime import datetime
import enum

class BookingStatus(enum.Enum):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    CANCELLED = 'CANCELLED'
    BOOKED = 'BOOKED'

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    move_in_date = db.Column(db.Date, nullable=False)
    lease_duration = db.Column(db.Integer, nullable=False)  # months
    status = db.Column(db.Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    
    notes = db.Column(db.Text)
    rejection_reason = db.Column(db.Text)
    
    approved_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('bookings', lazy=True))
    unit = db.relationship('Unit', backref=db.backref('bookings', lazy=True))

    def to_dict(self):
        unit = self.unit
        tower = unit.tower if unit else None
        user = self.user
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': user.name if user else None,
            'user_email': user.email if user else None,
            'user_phone': user.phone if user else None,
            'user_address': user.address if user else None,
            'user_city': user.city if user else None,
            'user_state': user.state if user else None,
            'user_zip_code': user.zip_code if user else None,
            'unit_id': self.unit_id,
            'unit_number': unit.unit_number if unit else None,
            'flat_type': unit.flat_type if unit else None,
            'rent_amount': unit.rent_amount if unit else None,
            'deposit_amount': unit.deposit_amount if unit else None,
            'square_feet': unit.square_feet if unit else None,
            'tower_name': tower.name if tower else None,
            'tower_id': tower.id if tower else None,
            'move_in_date': self.move_in_date.isoformat() if self.move_in_date else None,
            'lease_duration': self.lease_duration,
            'status': self.status.value,
            'notes': self.notes,
            'rejection_reason': self.rejection_reason,
            'unit_amenities': [a.to_dict() for a in unit.amenities] if unit else [],
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
