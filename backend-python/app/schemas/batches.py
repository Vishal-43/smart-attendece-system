from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class BatchBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    division_id: int
    name: str
    batch_number: int
    semester: int
    academic_year: str


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    division_id: Optional[int] = None
    name: Optional[str] = None
    batch_number: Optional[int] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None


class BatchOut(BatchBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
