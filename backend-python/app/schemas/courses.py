from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CourseBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    code: str
    duration_years: int
    total_semesters: int
    college_code: str


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    code: Optional[str] = None
    duration_years: Optional[int] = None
    total_semesters: Optional[int] = None
    college_code: Optional[str] = None


class CourseOut(CourseBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
