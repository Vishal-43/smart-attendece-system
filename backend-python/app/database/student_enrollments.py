from datetime import date, datetime
import enum

from sqlalchemy import Boolean, Column, Date, DateTime, Enum, ForeignKey, Integer, String

from app.database.database import Base


class EnrollmentYear(enum.Enum):
    I = 1
    II = 2
    III = 3
    IV = 4


class EnrollmentStatus(enum.Enum):
    ACTIVE = "active"
    DROPOUT = "dropout"
    GRADUATED = "graduated"


class StudentEnrollment(Base):
    __tablename__ = "student_enrollments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False)
    current_year = Column(Enum(EnrollmentYear), nullable=False)
    current_semester = Column(Integer, nullable=True)
    enrollment_number = Column(String(20), unique=True, nullable=False, index=True)
    enrollment_date = Column(Date, nullable=False)
    academic_year = Column(String(20), nullable=False)
    status = Column(Enum(EnrollmentStatus), nullable=False, default=EnrollmentStatus.ACTIVE)
    has_kt = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


