from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class DivisionBase(BaseModel):
    model_config = ConfigDict(extra='ignore')
    branch_id: int
    name: str
    year: int
    semester: int
    academic_year: str
    capacity: Optional[int] = None

class DivisionCreate(DivisionBase):
    pass

class DivisionUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    branch_id: Optional[int] = None
    name: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None
    capacity: Optional[int] = None

class DivisionOut(DivisionBase):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None