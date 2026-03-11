from flask import Blueprint, request, jsonify, current_app
import bcrypt
import jwt
from datetime import datetime, timedelta
from models.user import User, UserRole, UserLoginAudit
from extensions import db
import functools

auth_bp = Blueprint('auth', __name__)

def generate_token(user):
    payload = {
        'sub': user.id,
        'email': user.email,
        'role': user.role.value,
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

# Middleware to protect routes
def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['sub'])
            if not current_user or not current_user.is_active:
                return jsonify({'message': 'Invalid token or inactive user!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @functools.wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != UserRole.ADMIN:
            return jsonify({'message': 'Admin privileges required!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User with this email already exists'}), 409
        
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    # Check if role is specified and validate
    role = UserRole.USER
    if data.get('role') == 'ADMIN':
        role = UserRole.ADMIN

    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password.decode('utf-8'),
        role=role
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    email = data.get('email')
    ip_add = request.remote_addr
    device_inf = request.user_agent.string if request.user_agent else None
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.is_active:
        # Log FAILED attempt
        audit = UserLoginAudit(user_id=None, email=email, login_status='FAILED', ip_address=ip_add, device_info=device_inf)
        db.session.add(audit)
        db.session.commit()
        return jsonify({'message': 'Invalid credentials or inactive user'}), 401
        
    if bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        token = generate_token(user)
        
        # Log SUCCESS attempt
        audit = UserLoginAudit(user_id=user.id, email=email, login_status='SUCCESS', ip_address=ip_add, device_info=device_inf)
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    # Log FAILED attempt (wrong password)
    audit = UserLoginAudit(user_id=user.id, email=email, login_status='FAILED', ip_address=ip_add, device_info=device_inf)
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({'user': current_user.to_dict()}), 200
