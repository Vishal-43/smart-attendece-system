from datetime import datetime, timezone
import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

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
    marked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    device_info = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False
    )

    timetable = relationship("Timetable", back_populates="attendance_records")
    student = relationship("User", foreign_keys=[student_id])
    teacher = relationship("User", foreign_keys=[teacher_id])
