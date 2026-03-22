from datetime import datetime, time, timezone
import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Time,
)
from sqlalchemy.orm import relationship

from app.database.database import Base


class LectureType(enum.Enum):
    THEORY = "THEORY"
    PRACTICAL = "PRACTICAL"
    TUTORIAL = "TUTORIAL"


class DayOfWeek(enum.Enum):
    MON = "MON"
    TUE = "TUE"
    WED = "WED"
    THU = "THU"
    FRI = "FRI"
    SAT = "SAT"
    SUN = "SUN"


class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    division_id = Column(
        Integer, ForeignKey("divisions.id"), nullable=False, index=True
    )
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    lecture_type = Column(Enum(LectureType), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    day_of_week = Column(Enum(DayOfWeek), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    semester = Column(Integer, nullable=False)
    academic_year = Column(String(20), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False
    )

    subject = relationship("Subject", back_populates="timetables")
    attendance_records = relationship("AttendanceRecord", back_populates="timetable")
