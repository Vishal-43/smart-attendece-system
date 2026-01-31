from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.auth import AuthLoginRequest, AuthTokens, TokenRefreshRequest, UserPublic
from app.security.token import create_access_token, create_refresh_token, decode_token
from app.security.password import verify_password
from app.database.user import User
import logging

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/login",response_model=AuthTokens)
def login(credentials:AuthLoginRequest, db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    logging.warning(f" login attempt for {credentials}")
    logging.warning(f" fetched user {user.id}", user.username,user.password_hash)
    if not user or not verify_password(credentials.password, user.password_hash,credentials.name):
        
        raise HTTPException(status_code=401, detail="invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="inactive user")
    
    access_token = create_access_token({"sub":str(user.id)})
    refresh_token = create_refresh_token({"sub":str(user.id)})

    return AuthTokens(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=AuthTokens)
def refresh_token(request:TokenRefreshRequest, db:Session = Depends(get_db)):
    try:
        payload = decode_token(request.refresh_token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="invalid refresh token")
    except Exception:
        raise HTTPException(status_code=401, detail="invalid or expired refresh token")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="user not found or inactive user")
    access_token = create_access_token({"sub":str(user.id)})
    refresh_token = create_refresh_token({"sub":str(user.id)})
    
    return AuthTokens(access_token=access_token, refresh_token=refresh_token)

@router.get("/me",response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id = current_user.id,
        email=current_user.email,
        username=current_user.username,
        role=current_user.role.value,
        is_active=current_user.is_active
    )
