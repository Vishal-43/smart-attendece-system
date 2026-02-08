from datetime import datetime, time
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

from app.database.database import Base


class LectureType(enum.Enum):
    THEORY = "theory"
    PRACTICAL = "practical"
    TUTORIAL = "tutorial"


class DayOfWeek(enum.Enum):
    MON = "monday"
    TUE = "tuesday"
    WED = "wednesday"
    THU = "thursday"
    FRI = "friday"
    SAT = "saturday"


class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    division_id = Column(
        Integer, ForeignKey("divisions.id"), nullable=False, index=True
    )
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    subject = Column(String(100), nullable=False)
    lecture_type = Column(Enum(LectureType), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    day_of_week = Column(Enum(DayOfWeek), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    semester = Column(Integer, nullable=False)
    academic_year = Column(String(20), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
