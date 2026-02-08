from datetime import datetime, time
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.database.timetables import LectureType, DayOfWeek


class TimeTableBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    division_id: int
    teacher_id: int
    location_id: int
    subject: str
    lecture_type: LectureType
    batch_id: Optional[int] = None
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    semester: int
    academic_year: str
    is_active: bool


class TimeTableCreate(TimeTableBase):
    pass


class TimeTableUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    division_id: Optional[int] = None
    teacher_id: Optional[int] = None
    location_id: Optional[int] = None
    subject: Optional[str] = None
    lecture_type: Optional[LectureType] = None
    batch_id: Optional[int] = None
    day_of_week: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None
    is_active: Optional[bool] = None


class TimeTableOut(TimeTableBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
