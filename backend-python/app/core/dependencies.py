from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database.user import User
from app.security.jwt_token import decode_token
from typing import Generator

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token or expired")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.value not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user


def require_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.value not in ["student", "admin"]:
        raise HTTPException(status_code=403, detail="Student access required")
    return current_user


def require_role(*allowed_roles: str):
    """
    Factory function to create a dependency that requires one of the specified roles.
    
    Args:
        *allowed_roles: Variable length argument list of allowed role values
        
    Returns:
        A dependency function that checks if the current user has one of the allowed roles
    """
    def check_role(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"One of {allowed_roles} access required"
            )
        return current_user
    return check_role
