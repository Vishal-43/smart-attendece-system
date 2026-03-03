from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional


class UserPublic(BaseModel):
    id: int
    email: str
    username: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class AuthLoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str

    @model_validator(mode="after")
    def validate_identity(self):
        if not self.username and not self.email:
            raise ValueError("Either username or email is required")
        return self


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthLoginResponse(AuthTokens):
    user: UserPublic


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenPayload(BaseModel):
    sub: str
    exp: int
