# tests/conftest.py
# Test configuration and fixtures for the Smart Attendance System

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import Base
from app.core.dependencies import get_db
from app.database.user import User
from app.database.courses import Course
from app.database.branches import Branch
from app.database.divisions import Division
from app.database.batches import Batch
from app.database.locations import Location
from app.database.timetables import Timetable
from app.database.student_enrollments import StudentEnrollment
from app.database.qr_codes import QRCode
from app.database.otp_code import OTPCode
from app.security.password_hash import hash_password
from app.security.jwt_token import create_access_token


# Test database setup (SQLite in-memory)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create test database and provide session."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create test client with overridden database dependency."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ----- User Fixtures -----

@pytest.fixture
def admin_user(db):
    """Create an admin user."""
    user = User(
        email="admin@test.com",
        username="admin",
        hashed_password=hash_password("admin123"),
        first_name="Admin",
        last_name="User",
        role="admin",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user):
    """Create JWT token for admin user."""
    return create_access_token(admin_user.id)


@pytest.fixture
def teacher_user(db):
    """Create a teacher user."""
    user = User(
        email="teacher@test.com",
        username="teacher",
        hashed_password=hash_password("teacher123"),
        first_name="Teacher",
        last_name="User",
        role="teacher",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def teacher_token(teacher_user):
    """Create JWT token for teacher user."""
    return create_access_token(teacher_user.id)


@pytest.fixture
def student_user(db):
    """Create a student user."""
    user = User(
        email="student@test.com",
        username="student",
        hashed_password=hash_password("student123"),
        first_name="Student",
        last_name="User",
        role="student",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def student_token(student_user):
    """Create JWT token for student user."""
    return create_access_token(student_user.id)


# ----- Academic Structure Fixtures -----

@pytest.fixture
def course(db):
    """Create a test course."""
    course_obj = Course(
        name="Computer Science",
        code="CS101",
        description="Introduction to Computer Science"
    )
    db.add(course_obj)
    db.commit()
    db.refresh(course_obj)
    return course_obj


@pytest.fixture
def branch(db, course):
    """Create a test branch."""
    branch_obj = Branch(
        name="Software Engineering",
        code="SE",
        course_id=course.id
    )
    db.add(branch_obj)
    db.commit()
    db.refresh(branch_obj)
    return branch_obj


@pytest.fixture
def division(db, branch):
    """Create a test division."""
    division_obj = Division(
        name="A",
        branch_id=branch.id
    )
    db.add(division_obj)
    db.commit()
    db.refresh(division_obj)
    return division_obj


@pytest.fixture
def batch(db, division):
    """Create a test batch."""
    batch_obj = Batch(
        name="Batch 2024",
        year=2024,
        division_id=division.id
    )
    db.add(batch_obj)
    db.commit()
    db.refresh(batch_obj)
    return batch_obj


@pytest.fixture
def location(db):
    """Create a test location."""
    location_obj = Location(
        name="Main Campus Room 101",
        address="123 University Avenue",
        latitude=12.9716,
        longitude=77.5946,
        radius=100.0
    )
    db.add(location_obj)
    db.commit()
    db.refresh(location_obj)
    return location_obj


@pytest.fixture
def timetable(db, teacher_user, division, location):
    """Create a test timetable."""
    timetable_obj = TimeTable(
        subject="Data Structures",
        teacher_id=teacher_user.id,
        division_id=division.id,
        location_id=location.id,
        day_of_week="Monday",
        start_time="09:00",
        end_time="10:30",
        is_active=True
    )
    db.add(timetable_obj)
    db.commit()
    db.refresh(timetable_obj)
    return timetable_obj


@pytest.fixture
def enrollment(db, student_user, division):
    """Create a student enrollment."""
    enrollment_obj = StudentEnrollment(
        student_id=student_user.id,
        course_id=1,  # Assuming course ID 1 exists
        branch_id=1,  # Assuming branch ID 1 exists
        division_id=division.id,
        is_active=True
    )
    db.add(enrollment_obj)
    db.commit()
    db.refresh(enrollment_obj)
    return enrollment_obj


# ----- QR/OTP Fixtures -----

@pytest.fixture
def valid_qr_code(db, timetable):
    """Create a valid QR code."""
    qr = QRCode(
        timetable_id=timetable.id,
        code="test_qr_token_12345",
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        is_active=True,
        used_count=0
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)
    return qr


@pytest.fixture
def expired_qr_code(db, timetable):
    """Create an expired QR code."""
    qr = QRCode(
        timetable_id=timetable.id,
        code="expired_qr_token_12345",
        expires_at=datetime.utcnow() - timedelta(minutes=5),
        is_active=True,
        used_count=0
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)
    return qr


@pytest.fixture
def valid_otp_code(db, timetable):
    """Create a valid OTP code."""
    otp = OTPCode(
        timetable_id=timetable.id,
        code="123456",
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_active=True,
        used_count=0
    )
    db.add(otp)
    db.commit()
    db.refresh(otp)
    return otp


@pytest.fixture
def expired_otp_code(db, timetable):
    """Create an expired OTP code."""
    otp = OTPCode(
        timetable_id=timetable.id,
        code="654321",
        expires_at=datetime.utcnow() - timedelta(minutes=1),
        is_active=True,
        used_count=0
    )
    db.add(otp)
    db.commit()
    db.refresh(otp)
    return otp
