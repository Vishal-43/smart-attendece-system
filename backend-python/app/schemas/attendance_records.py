from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.database.attendance_records import AttendanceStatus


class AttendanceRecordBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    timetable_id: int
    student_id: int
    enrollment_id: int
    teacher_id: int
    division_id: int
    batch_id: Optional[int] = None
    location_id: Optional[int] = None
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


class MarkAttendanceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    timetable_id: int = Field(..., description="The timetable session ID")
    method: Literal["qr", "otp"] = Field(..., description="Attendance marking method")
    code: str = Field(..., min_length=1, description="QR code or OTP value")
    latitude: Optional[float] = Field(None, description="GPS latitude")
    longitude: Optional[float] = Field(None, description="GPS longitude")
    bssid: Optional[str] = Field(None, description="WiFi access point MAC address (BSSID of the router)")
    device_info: Optional[str] = Field(None, description="Device information")
