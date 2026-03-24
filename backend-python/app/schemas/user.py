from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from app.database.user import UserRole


class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    is_active: bool = True

    @field_validator('role', mode='before')
    @classmethod
    def validate_role(cls, v):
        if v is None:
            return UserRole.STUDENT
        if isinstance(v, UserRole):
            return v
        if isinstance(v, str):
            upper = v.upper()
            for role in UserRole:
                if role.value == upper:
                    return role
            raise ValueError(f"Invalid role: {v}. Must be one of: ADMIN, TEACHER, STUDENT")
        return v


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator('role', mode='before')
    @classmethod
    def validate_role(cls, v):
        if v is None:
            return None
        if isinstance(v, UserRole):
            return v
        if isinstance(v, str):
            upper = v.upper()
            for role in UserRole:
                if role.value == upper:
                    return role
            raise ValueError(f"Invalid role: {v}. Must be one of: ADMIN, TEACHER, STUDENT")
        return v


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    email: EmailStr
    username: str
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    role: UserRole
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
