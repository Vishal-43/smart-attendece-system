from pydantic import BaseModel, EmailStr
from typing import Optional

class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthTokens(BaseModel):
    access_token:str
    refresh_token:str
    token_type:str = "bearer"

class TokenRefreshRequest(BaseModel):
    refresh_token:str

class UserPublic(BaseModel):
    id: int
    email: str
    username: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class TokenPayload(BaseModel):
    sub: str
    exp: int

    