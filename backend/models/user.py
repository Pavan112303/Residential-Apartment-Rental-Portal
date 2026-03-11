from extensions import db
from datetime import datetime
import enum

class UserRole(enum.Enum):
    ADMIN = 'ADMIN'
    USER = 'USER'

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    zip_code = db.Column(db.String(20), nullable=True)
    
    audit_logs = db.relationship('UserLoginAudit', backref='user_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role.value,
            'is_active': self.is_active,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class UserLoginAudit(db.Model):
    __tablename__ = 'user_login_audit'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Nullable for failed unknown emails
    email = db.Column(db.String(120), nullable=False)
    login_time = db.Column(db.DateTime, default=datetime.utcnow)
    login_status = db.Column(db.String(20), nullable=False) # 'SUCCESS' or 'FAILED'
    ip_address = db.Column(db.String(45), nullable=True) # IPv6 can be up to 45 chars
    device_info = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'email': self.email,
            'login_time': self.login_time.isoformat() if self.login_time else None,
            'login_status': self.login_status,
            'ip_address': self.ip_address,
            'device_info': self.device_info,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
