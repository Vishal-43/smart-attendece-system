from datetime import date, datetime, time, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db
from app.database.batches import Batch
from app.database.branches import Branch
from app.database.courses import Course
from app.database.database import Base
from app.database.divisions import Division
from app.database.locations import Location, RoomType
from app.database.otp_code import OTPCode
from app.database.qr_codes import QRCode
from app.database.student_enrollments import (
    EnrollmentStatus,
    EnrollmentYear,
    StudentEnrollment,
)
from app.database.timetables import DayOfWeek, LectureType, Timetable
from app.database.user import User, UserRole
from app.main import app
from app.security.jwt_token import create_access_token
from app.security.password import hash_password


SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db):
    user = User(
        email="admin@test.com",
        username="admin",
        password_hash=hash_password("admin123", "admin"),
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user):
    return create_access_token({"sub": str(admin_user.id)})


@pytest.fixture
def teacher_user(db):
    user = User(
        email="teacher@test.com",
        username="teacher",
        password_hash=hash_password("teacher123", "teacher"),
        first_name="Teacher",
        last_name="User",
        role=UserRole.TEACHER,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def teacher_token(teacher_user):
    return create_access_token({"sub": str(teacher_user.id)})


@pytest.fixture
def student_user(db):
    user = User(
        email="student@test.com",
        username="student",
        password_hash=hash_password("student123", "student"),
        first_name="Student",
        last_name="User",
        role=UserRole.STUDENT,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def student_token(student_user):
    return create_access_token({"sub": str(student_user.id)})


@pytest.fixture
def course(db):
    obj = Course(
        name="Computer Science",
        code="CS101",
        duration_years=4,
        total_semesters=8,
        college_code="ENGG",
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def branch(db, course):
    obj = Branch(
        name="Software Engineering",
        code="SE",
        branch_code="SWE",
        course_id=course.id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def division(db, branch):
    obj = Division(
        name="A",
        branch_id=branch.id,
        year=1,
        semester=1,
        academic_year="2025-2026",
        capacity=80,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def batch(db, division):
    obj = Batch(
        name="Batch 1",
        division_id=division.id,
        batch_number=1,
        semester=1,
        academic_year="2025-2026",
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def location(db):
    obj = Location(
        name="Main Campus Room 101",
        latitude=12.9716,
        longitude=77.5946,
        radius=100,
        room_no="101",
        floor=1,
        room_type=RoomType.CLASSROOM,
        capacity=80,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def timetable(db, teacher_user, division, location):
    obj = Timetable(
        subject="Data Structures",
        teacher_id=teacher_user.id,
        division_id=division.id,
        location_id=location.id,
        lecture_type=LectureType.THEORY,
        day_of_week=DayOfWeek.MON,
        start_time=time(9, 0),
        end_time=time(10, 0),
        semester=1,
        academic_year="2025-2026",
        is_active=True,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def enrollment(db, student_user, course, branch, division):
    obj = StudentEnrollment(
        student_id=student_user.id,
        course_id=course.id,
        branch_id=branch.id,
        division_id=division.id,
        current_year=EnrollmentYear.I,
        current_semester=1,
        enrollment_number="ENR001",
        enrollment_date=date.today(),
        academic_year="2025-2026",
        status=EnrollmentStatus.ACTIVE,
        has_kt=False,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def valid_qr_code(db, timetable):
    obj = QRCode(
        timetable_id=timetable.id,
        code="test_qr_token_12345",
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        used_count=0,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def expired_qr_code(db, timetable):
    obj = QRCode(
        timetable_id=timetable.id,
        code="expired_qr_token_12345",
        expires_at=datetime.utcnow() - timedelta(minutes=5),
        used_count=0,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def valid_otp_code(db, timetable):
    obj = OTPCode(
        timetable_id=timetable.id,
        code="123456",
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        used_count=0,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@pytest.fixture
def expired_otp_code(db, timetable):
    obj = OTPCode(
        timetable_id=timetable.id,
        code="654321",
        expires_at=datetime.utcnow() - timedelta(minutes=1),
        used_count=0,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
