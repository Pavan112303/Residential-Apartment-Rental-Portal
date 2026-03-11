from extensions import db
from datetime import datetime
import enum

class MaintenanceStatus(enum.Enum):
    OPEN = 'OPEN'
    IN_PROGRESS = 'IN_PROGRESS'
    RESOLVED = 'RESOLVED'

class MaintenanceRequest(db.Model):
    __tablename__ = 'maintenance_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    
    category = db.Column(db.String(50), nullable=False) # plumbing, electrical, etc.
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255)) # Optional image
    
    status = db.Column(db.Enum(MaintenanceStatus), default=MaintenanceStatus.OPEN, nullable=False)
    admin_comment = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('maintenance_requests', lazy=True))
    unit = db.relationship('Unit', backref=db.backref('maintenance_requests', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'unit_id': self.unit_id,
            'category': self.category,
            'description': self.description,
            'image_url': self.image_url,
            'status': self.status.value,
            'admin_comment': self.admin_comment,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
