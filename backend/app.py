from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from extensions import db

load_dotenv()


def create_app():
    app = Flask(__name__)

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Allow frontend URL from env variable (Railway URL in production,
    # localhost in development). Falls back to * if not set.
    frontend_url = os.getenv('FRONTEND_URL', '*')
    CORS(app, origins=[frontend_url] if frontend_url != '*' else '*',
         supports_credentials=True)

    # ── Configuration ─────────────────────────────────────────────────────────
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key')

    # Railway provides DATABASE_URL with the old `postgres://` prefix.
    # SQLAlchemy 1.4+ requires `postgresql://`, so we fix it here.
    db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/rental_portal')
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        # Import models here to ensure they are registered with SQLAlchemy
        from models import user, apartment, booking, lease, maintenance, activity, review, payment

        # Create database tables
        db.create_all()

        # Startup migrations: safely add new columns (idempotent)
        from sqlalchemy import text
        with db.engine.connect() as conn:
            for stmt in [
                "ALTER TABLE towers ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE'",
                "ALTER TABLE leases ADD COLUMN termination_reason TEXT",
                "ALTER TABLE amenities ADD COLUMN category VARCHAR(50) DEFAULT 'General'",
                "ALTER TABLE amenities ADD COLUMN description TEXT",
                "ALTER TABLE maintenance_requests ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM'",
                "ALTER TYPE unitstatus ADD VALUE IF NOT EXISTS 'BLOCKED'",
                "ALTER TYPE unitstatus ADD VALUE IF NOT EXISTS 'LOCKED'",
                "ALTER TABLE towers ALTER COLUMN tower_code TYPE VARCHAR(50)",
                # Location columns
                "ALTER TABLE towers ADD COLUMN country VARCHAR(100)",
                "ALTER TABLE towers ADD COLUMN state VARCHAR(100)",
                "ALTER TABLE towers ADD COLUMN city VARCHAR(100)",
                "ALTER TABLE towers ADD COLUMN area VARCHAR(100)",
                "ALTER TABLE towers ADD COLUMN pincode VARCHAR(20)",
                "ALTER TABLE towers ADD COLUMN address_line TEXT",
                "ALTER TABLE towers ADD COLUMN latitude FLOAT",
                "ALTER TABLE towers ADD COLUMN longitude FLOAT",
                # Indexes for fast location search
                "CREATE INDEX IF NOT EXISTS idx_towers_city ON towers(city)",
                "CREATE INDEX IF NOT EXISTS idx_towers_area ON towers(area)",
                "CREATE INDEX IF NOT EXISTS idx_towers_pincode ON towers(pincode)",
                # Audit logs migrations
                "ALTER TABLE user_login_audit ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "ALTER TABLE leases ADD COLUMN IF NOT EXISTS vacate_request_status VARCHAR(20);",
                "ALTER TABLE leases ADD COLUMN IF NOT EXISTS vacate_request_date TIMESTAMP;",
                "ALTER TABLE leases ADD COLUMN IF NOT EXISTS vacate_reason TEXT;",
                "ALTER TABLE leases ADD COLUMN IF NOT EXISTS desired_vacate_date DATE;",
                # User profile columns
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);",
                "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;",
                "ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'CANCELLED';",
                "ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'BOOKED';"
            ]:
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                except Exception:
                    conn.rollback()

        # ── Clean up old local filesystem image paths ───────────────────────
        # After migrating to Cloudinary, old paths like 'static/uploads/...'
        # are broken. Clear them so admins can re-upload via Cloudinary.
        with db.engine.connect() as conn:
            try:
                conn.execute(text(
                    "DELETE FROM unit_images WHERE image_path NOT LIKE 'http%'"
                ))
                conn.execute(text(
                    "UPDATE towers SET tower_image = NULL WHERE tower_image IS NOT NULL AND tower_image NOT LIKE 'http%'"
                ))
                conn.commit()
            except Exception:
                conn.rollback()

        # ── Seed default admin account (idempotent) ────────────────────────
        from models.user import User, UserRole
        import bcrypt as _bcrypt

        admin = User.query.filter_by(email='admin@rentalportal.com').first()
        if not admin:
            hashed = _bcrypt.hashpw('Admin@123'.encode('utf-8'), _bcrypt.gensalt()).decode('utf-8')
            admin = User(
                name='System Admin',
                email='admin@rentalportal.com',
                password_hash=hashed,
                role=UserRole.ADMIN,
                is_active=True
            )
            db.session.add(admin)
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
        elif admin.role != UserRole.ADMIN:
            admin.role = UserRole.ADMIN
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()


    # Register Blueprints
    from api.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from api.admin.routes import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    from api.user.routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/user')

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Residential Rental Portal API is running!'}, 200

    return app


# Create app instance at module level so Gunicorn can import it directly:
#   gunicorn app:app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)
