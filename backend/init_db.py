from app import create_app
from extensions import db
from models.user import User, UserRole
import bcrypt

app = create_app()

with app.app_context():
    # Create all tables (safe - skips existing ones)
    db.create_all()
    print("Database tables verified/created.")

    # Seed default admin account
    admin = User.query.filter_by(email='admin@rentalportal.com').first()
    if not admin:
        print("Creating default Admin user...")
        hashed_password = bcrypt.hashpw('Admin@123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin_user = User(
            name='System Admin',
            email='admin@rentalportal.com',
            password_hash=hashed_password,
            role=UserRole.ADMIN,
            is_active=True
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Default Admin created successfully!")
        print("Email: admin@rentalportal.com")
        print("Password: Admin@123")
    else:
        print(f"Admin user already exists with role: {admin.role}")
        # Ensure the role is ADMIN
        if admin.role != UserRole.ADMIN:
            admin.role = UserRole.ADMIN
            db.session.commit()
            print("Admin role fixed to ADMIN.")
