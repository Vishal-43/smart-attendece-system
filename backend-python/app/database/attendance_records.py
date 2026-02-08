from datetime import datetime
import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String

from app.database.database import Base


class AttendanceStatus(enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    enrollment_id = Column(
        Integer, ForeignKey("student_enrollments.id"), nullable=False
    )
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    marked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    device_info = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
