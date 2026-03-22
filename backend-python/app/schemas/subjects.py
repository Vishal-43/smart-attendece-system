from pydantic import BaseModel
from typing import Optional


class SubjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    course_id: int
    branch_id: int
    semester: int
    is_active: bool = True


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[int] = None
    branch_id: Optional[int] = None
    semester: Optional[int] = None
    is_active: Optional[bool] = None


class SubjectOut(SubjectBase):
    id: int

    class Config:
        from_attributes = True
