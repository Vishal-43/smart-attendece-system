#!/usr/bin/env python3
"""
Table recreation and database seeding script
This script creates all tables from the ORM models and seeds initial users
"""
import sys
import os

# Set the path to include backend-python
sys.path.insert(0, '/home/vishal/code/smartattendencesystem/backend-python')
os.chdir('/home/vishal/code/smartattendencesystem/backend-python')

from app.database.database import engine, Base, SessionLocal
from app.database.user import User, UserRole
from app.security.password import hash_password

print("=" * 70)
print("STEP 1: Importing all database models...")
print("=" * 70)

# Import all models to ensure they're registered with Base
try:
    from app.database.user import User
    from app.database.courses import Course
    from app.database.branches import Branch
    from app.database.divisions import Division
    from app.database.batches import Batch
    from app.database.subjects import Subject
    from app.database.student_enrollments import StudentEnrollment
    from app.database.locations import Location
    from app.database.timetables import Timetable
    from app.database.qr_codes import QRCode
    from app.database.otp_code import OTPCode
    from app.database.attendance_records import AttendanceRecord
    from app.database.audit_log import AuditLog
    from app.database.notifications import Notification
    from app.database.password_reset_tokens import PasswordResetToken
    from app.database.user_preferences import UserPreferences
    from app.database.access_points import AccessPoint
    print("✓ All models imported successfully")
except Exception as e:
    print(f"✗ Error importing models: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 70)
print("STEP 2: Creating all database tables...")
print("=" * 70)

try:
    # Drop all existing tables
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("✓ Old tables dropped")
    
    # Create all tables from models
    print("Creating new tables from models...")
    Base.metadata.create_all(bind=engine)
    print("✓ All tables created successfully")
except Exception as e:
    print(f"✗ Error creating tables: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 70)
print("STEP 3: Seeding database with test users...")
print("=" * 70)

db = SessionLocal()

try:
    test_users = [
        {
            "email": "admin@smartattendance.com",
            "username": "admin",
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "phone": "9999999999",
            "role": UserRole.ADMIN,
        },
        {
            "email": "teacher1@smartattendance.com",
            "username": "teacher1",
            "password": "teacher123",
            "first_name": "Rajesh",
            "last_name": "Kumar",
            "phone": "9876543210",
            "role": UserRole.TEACHER,
        },
        {
            "email": "teacher2@smartattendance.com",
            "username": "teacher2",
            "password": "teacher123",
            "first_name": "Priya",
            "last_name": "Sharma",
            "phone": "9876543211",
            "role": UserRole.TEACHER,
        },
        {
            "email": "student1@smartattendance.com",
            "username": "student1",
            "password": "student123",
            "first_name": "Aditya",
            "last_name": "Singh",
            "phone": "9876543220",
            "role": UserRole.STUDENT,
        },
        {
            "email": "student2@smartattendance.com",
            "username": "student2",
            "password": "student123",
            "first_name": "Neha",
            "last_name": "Verma",
            "phone": "9876543221",
            "role": UserRole.STUDENT,
        },
    ]

    for user_data in test_users:
        user = User(
            email=user_data["email"],
            username=user_data["username"],
            password_hash=hash_password(user_data["password"], user_data["username"]),
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            phone=user_data["phone"],
            role=user_data["role"],
            is_active=True,
        )
        db.add(user)
        print(f"  Creating {user_data['role'].value:8} - {user_data['username']:12} ({user_data['email']})")
    
    db.commit()
    print("✓ All test users created successfully\n")

    # Display summary
    user_count = db.query(User).count()
    print("=" * 70)
    print(f"DATABASE SETUP COMPLETE!")
    print("=" * 70)
    print(f"✓ Total users created: {user_count}")
    print("\nTest Credentials:")
    print("  ADMIN    : admin    / admin123")
    print("  TEACHER1 : teacher1 / teacher123")
    print("  TEACHER2 : teacher2 / teacher123")
    print("  STUDENT1 : student1 / student123")
    print("  STUDENT2 : student2 / student123")
    print("=" * 70)

except Exception as e:
    print(f"✗ Error seeding users: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    sys.exit(1)
finally:
    db.close()
