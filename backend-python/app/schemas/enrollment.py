from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.database.student_enrollments import EnrollmentStatus, EnrollmentYear


class EnrollmentBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student_id: int
    course_id: int
    branch_id: int
    division_id: int
    current_year: EnrollmentYear
    current_semester: int
    enrollment_number: str
    enrollment_date: date
    academic_year: str
    status: EnrollmentStatus
    has_kt: bool = False


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    current_year: Optional[EnrollmentYear] = None
    current_semester: Optional[int] = None
    status: Optional[EnrollmentStatus] = None
    has_kt: Optional[bool] = None


class EnrollmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    student_id: int
    course_id: int
    branch_id: int
    division_id: int
    current_year: EnrollmentYear
    current_semester: int
    enrollment_number: str
    enrollment_date: date
    academic_year: str
    status: EnrollmentStatus
    has_kt: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
