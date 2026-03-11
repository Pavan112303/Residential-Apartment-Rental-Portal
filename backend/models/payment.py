from extensions import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_method = db.Column(db.String(50), nullable=False) # e.g. CREDIT_CARD, UPI, BANK_TRANSFER
    payment_type = db.Column(db.String(50), nullable=False)   # e.g. RENT, DEPOSIT, MAINTENANCE
    status = db.Column(db.String(20), default='SUCCESS')      # SUCCESS, PENDING, FAILED
    reference_id = db.Column(db.String(100), nullable=True)   # External tx ID
    notes = db.Column(db.Text, nullable=True)

    user = db.relationship('User', backref=db.backref('payments', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'amount': self.amount,
            'payment_date': self.payment_date.isoformat(),
            'payment_method': self.payment_method,
            'payment_type': self.payment_type,
            'status': self.status,
            'reference_id': self.reference_id,
            'notes': self.notes
        }
