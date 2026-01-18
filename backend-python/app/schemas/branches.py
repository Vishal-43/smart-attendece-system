from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class BranchBase(BaseModel):
    model_config = ConfigDict(extra='ignore')
    course_id: int
    name: str
    code: str
    branch_code: str

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    course_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    branch_code: Optional[str] = None

class BranchOut(BranchBase):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
