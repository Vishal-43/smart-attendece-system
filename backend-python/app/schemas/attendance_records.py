from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.database.attendance_records import AttendanceStatus


class AttendanceRecordBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    timetable_id: int
    student_id: int
    enrollment_id: int
    teacher_id: int
    division_id: int
    batch_id: Optional[int] = None
    location_id: int
    status: AttendanceStatus
    device_info: Optional[str] = None


class AttendanceRecordCreate(AttendanceRecordBase):
    pass


class AttendanceRecordUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[AttendanceStatus] = None
    device_info: Optional[str] = None


class AttendanceRecordOut(AttendanceRecordBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    marked_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
