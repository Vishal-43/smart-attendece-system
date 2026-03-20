from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.core.email import email_service
from app.core.response import success_response
from app.schemas.auth import (
    AuthForgotPasswordRequest,
    AuthLoginRequest,
    AuthLoginResponse,
    AuthRegisterRequest,
    AuthResetPasswordRequest,
    AuthTokens,
    TokenRefreshRequest,
    UserPublic,
)
from app.security.jwt_token import create_access_token, create_refresh_token, decode_token
from app.security.password import hash_password, verify_password
from app.database.password_reset_tokens import PasswordResetToken
from app.database.user import User
from datetime import datetime, timedelta
import hashlib
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=AuthLoginResponse, status_code=status.HTTP_201_CREATED)
def register(payload: AuthRegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    user = User(
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password, payload.username),
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return success_response(
        data={
            "access_token": create_access_token({"sub": str(user.id)}),
            "refresh_token": create_refresh_token({"sub": str(user.id)}),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "role": user.role.value,
                "is_active": user.is_active,
            },
        },
        message="Registration successful",
        status_code=201,
    )


@router.post("/login")
def login(credentials: AuthLoginRequest, db: Session = Depends(get_db)):
    user = None
    if credentials.email:
        user = db.query(User).filter(User.email == credentials.email).first()
    elif credentials.username:
        user = db.query(User).filter(User.username == credentials.username).first()

    if not user or not verify_password(
        credentials.password, user.password_hash, user.username
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "role": user.role.value,
                "is_active": user.is_active,
            },
        },
        message="Login successful",
    )


@router.post("/refresh")
def refresh_token(request: TokenRefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(request.refresh_token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="User not found or inactive")

    access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token = create_refresh_token({"sub": str(user.id)})

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": new_refresh_token,
        },
        message="Token refreshed successfully",
    )


@router.post("/logout")
def logout(_=None):
    return success_response(None, "Logged out successfully")


@router.post("/forgot-password")
def forgot_password(payload: AuthForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return success_response(
            data={"reset_sent": False},
            message="If the email exists, reset instructions were sent",
        )

    reset_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(reset_token.encode("utf-8")).hexdigest()

    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=30),
        )
    )
    db.commit()

    email_service.send_password_reset_email(payload.email, reset_token)

    return success_response(
        data={"reset_sent": True},
        message="If the email exists, reset instructions were sent",
    )


@router.post("/reset-password")
def reset_password(payload: AuthResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(payload.token.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    reset_entry = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at >= now,
        )
        .first()
    )
    if not reset_entry:
        raise HTTPException(status_code=401, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == reset_entry.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.new_password, user.username)
    reset_entry.used_at = now
    db.commit()

    return success_response(None, "Password has been reset")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return success_response(
        data={
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "phone": current_user.phone,
            "role": current_user.role.value,
            "is_active": current_user.is_active,
        },
        message="User retrieved successfully",
    )


@router.post("/is-admin")
def is_admin(current_user: User = Depends(get_current_user)):
    return success_response(
        data={"is_admin": current_user.role.value == "admin"},
        message="Admin check completed",
    )
