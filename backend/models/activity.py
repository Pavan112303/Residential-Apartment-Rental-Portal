from extensions import db
from datetime import datetime

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    action = db.Column(db.String(100), nullable=False) # e.g., 'BOOKING_APPROVED', 'UNIT_STATUS_CHANGED'
    entity_type = db.Column(db.String(50), nullable=False) # e.g., 'Booking', 'Unit', 'Lease'
    entity_id = db.Column(db.Integer, nullable=False)
    
    details = db.Column(db.Text) # Optional JSON or text details
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('activity_logs', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details,
            'timestamp': self.timestamp.isoformat()
        }
