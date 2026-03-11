from extensions import db
from datetime import datetime
import enum

class UnitStatus(enum.Enum):
    AVAILABLE = 'AVAILABLE'
    BOOKED = 'BOOKED'
    LOCKED = 'LOCKED'
    LEASED = 'LEASED'
    UNDER_MAINTENANCE = 'UNDER_MAINTENANCE'
    BLOCKED = 'BLOCKED'

class TowerStatus(enum.Enum):
    ACTIVE = 'ACTIVE'
    UNDER_MAINTENANCE = 'UNDER_MAINTENANCE'
    INACTIVE = 'INACTIVE'

class Tower(db.Model):
    __tablename__ = 'towers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    tower_code = db.Column(db.String(50), nullable=False, unique=True)
    total_floors = db.Column(db.Integer, nullable=False)
    flats_per_floor = db.Column(db.Integer, nullable=False)
    total_units = db.Column(db.Integer, nullable=False)
    tower_image = db.Column(db.String(255))
    description = db.Column(db.Text)
    status = db.Column(db.Enum('ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE', name='towerstatus', create_type=False), default='ACTIVE', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Location fields
    country      = db.Column(db.String(100))
    state        = db.Column(db.String(100))
    city         = db.Column(db.String(100))
    area         = db.Column(db.String(100))
    pincode      = db.Column(db.String(20))
    address_line = db.Column(db.Text)
    latitude     = db.Column(db.Float)
    longitude    = db.Column(db.Float)

    units = db.relationship('Unit', backref='tower', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'tower_code': self.tower_code,
            'total_floors': self.total_floors,
            'flats_per_floor': self.flats_per_floor,
            'total_units': self.total_units,
            'tower_image': self.tower_image,
            'description': self.description,
            'status': self.status or 'ACTIVE',
            'created_at': self.created_at.isoformat(),
            'amenities': [a.to_dict() for a in getattr(self, 'amenities', [])],
            # Location
            'country':      self.country,
            'state':        self.state,
            'city':         self.city,
            'area':         self.area,
            'pincode':      self.pincode,
            'address_line': self.address_line,
            'latitude':     self.latitude,
            'longitude':    self.longitude,
        }

class FloorLayout(db.Model):
    __tablename__ = 'floor_layouts'
    
    id = db.Column(db.Integer, primary_key=True)
    tower_id = db.Column(db.Integer, db.ForeignKey('towers.id'), nullable=False)
    floor_number = db.Column(db.Integer, nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tower = db.relationship('Tower', backref=db.backref('floor_layouts', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'tower_id': self.tower_id,
            'floor_number': self.floor_number,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat()
        }

class AmenityStatus(enum.Enum):
    OPEN = 'OPEN'
    CLOSED = 'CLOSED'
    MAINTENANCE = 'MAINTENANCE'

class Amenity(db.Model):
    __tablename__ = 'amenities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50))
    category = db.Column(db.String(50), default='General')
    description = db.Column(db.Text)
    tower_id = db.Column(db.Integer, db.ForeignKey('towers.id'), nullable=True)
    status = db.Column(db.Enum(AmenityStatus), default=AmenityStatus.OPEN)
    
    tower = db.relationship('Tower', backref=db.backref('specific_amenities', lazy=True, cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'category': self.category or 'General',
            'description': self.description,
            'tower_id': self.tower_id,
            'tower_name': self.tower.name if self.tower else None,
            'status': self.status.value if self.status else 'OPEN'
        }

tower_amenities = db.Table('tower_amenities',
    db.Column('tower_id', db.Integer, db.ForeignKey('towers.id'), primary_key=True),
    db.Column('amenity_id', db.Integer, db.ForeignKey('amenities.id'), primary_key=True)
)

Tower.amenities = db.relationship('Amenity', secondary=tower_amenities, lazy='subquery',
    backref=db.backref('towers', lazy=True))

unit_amenities = db.Table('unit_amenities',
    db.Column('unit_id', db.Integer, db.ForeignKey('units.id'), primary_key=True),
    db.Column('amenity_id', db.Integer, db.ForeignKey('amenities.id'), primary_key=True)
)

class UnitImage(db.Model):
    __tablename__ = 'unit_images'
    
    id = db.Column(db.Integer, primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'unit_id': self.unit_id,
            'image_path': self.image_path
        }

class Unit(db.Model):
    __tablename__ = 'units'

    id = db.Column(db.Integer, primary_key=True)
    tower_id = db.Column(db.Integer, db.ForeignKey('towers.id'), nullable=False)
    floor_number = db.Column(db.Integer, nullable=False)
    unit_number = db.Column(db.String(20), nullable=False)
    flat_type = db.Column(db.String(50), nullable=False)
    rent_amount = db.Column(db.Float, nullable=False)
    deposit_amount = db.Column(db.Float, nullable=False, default=0.0)
    square_feet = db.Column(db.Float)
    facing_direction = db.Column(db.String(50))
    balcony_count = db.Column(db.Integer, default=0)
    bathrooms_count = db.Column(db.Integer, default=1)
    status = db.Column(db.Enum('AVAILABLE', 'BOOKED', 'LOCKED', 'LEASED', 'UNDER_MAINTENANCE', 'BLOCKED', name='unitstatus', create_type=False), default='AVAILABLE', nullable=False)
    description = db.Column(db.Text)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    amenities = db.relationship('Amenity', secondary=unit_amenities, lazy='subquery',
        backref=db.backref('units', lazy=True))
    
    images = db.relationship('UnitImage', backref='unit', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'tower_id': self.tower_id,
            'tower_name': self.tower.name if self.tower else None,
            'tower_code': self.tower.tower_code if self.tower else None,
            'floor_number': self.floor_number,
            'unit_number': self.unit_number,
            'flat_type': self.flat_type,
            'rent_amount': self.rent_amount,
            'deposit_amount': self.deposit_amount,
            'square_feet': self.square_feet,
            'facing_direction': self.facing_direction,
            'balcony_count': self.balcony_count,
            'bathrooms_count': self.bathrooms_count,
            'status': self.status if self.status else 'AVAILABLE',
            'description': self.description,
            'amenities': [a.to_dict() for a in self.amenities],
            'images': [i.to_dict() for i in getattr(self, 'images', [])],
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
