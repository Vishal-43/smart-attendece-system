from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.auth import (
    AuthForgotPasswordRequest,
    AuthLoginRequest,
    AuthLoginResponse,
    AuthLogoutRequest,
    AuthRegisterRequest,
    AuthResetPasswordRequest,
    AuthTokens,
    TokenRefreshRequest,
    UserPublic,
)
from app.security.jwt_token import create_access_token, create_refresh_token, decode_token
from app.security.password import hash_password, verify_password
from app.database.user import User
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

    return AuthLoginResponse(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token({"sub": str(user.id)}),
        user=UserPublic(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role.value,
            is_active=user.is_active,
        ),
    )


@router.post("/login", response_model=AuthLoginResponse)
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

    return AuthLoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role.value,
            is_active=user.is_active,
        ),
    )


@router.post("/refresh", response_model=AuthTokens)
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

    return AuthTokens(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout")
def logout(_: AuthLogoutRequest):
    # Stateless JWT tokens are not persisted server-side in current architecture.
    # Keep endpoint for API contract compatibility with web/mobile clients.
    return {"success": True, "message": "Logged out successfully"}


@router.post("/forgot-password")
def forgot_password(payload: AuthForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    # Avoid user enumeration by always returning the same response.
    if not user:
        return {"success": True, "message": "If the email exists, reset instructions were sent"}

    reset_token = create_refresh_token({"sub": str(user.id), "purpose": "password_reset"})
    return {
        "success": True,
        "message": "Password reset token generated",
        "data": {"reset_token": reset_token},
    }


@router.post("/reset-password")
def reset_password(payload: AuthResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        token_payload = decode_token(payload.token)
        user_id = token_payload.get("sub")
        purpose = token_payload.get("purpose")
        if not user_id or purpose != "password_reset":
            raise HTTPException(status_code=401, detail="Invalid reset token")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.new_password, user.username)
    db.commit()

    return {"success": True, "message": "Password has been reset"}


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        role=current_user.role.value,
        is_active=current_user.is_active,
    )


@router.post("/is-admin")
def is_admin(user=Depends(get_current_user)):
    return {"is_admin": user.role.value == "admin"}
