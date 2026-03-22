from typing import Optional, Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.user import User
from app.security.jwt_token import decode_token

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
    if current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.value not in ["ADMIN", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.value not in ["ADMIN", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Teacher or admin access required")
    return current_user


def require_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.value not in ["STUDENT", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Student access required")
    return current_user


def require_role(*allowed_roles):
    def check_role(current_user: User = Depends(get_current_user)) -> User:
        role_strings = [r.value if hasattr(r, 'value') else str(r) for r in allowed_roles]
        if current_user.role.value not in role_strings:
            raise HTTPException(
                status_code=403,
                detail=f"One of {allowed_roles} access required"
            )
        return current_user
    return check_role


def get_teacher_branch_id(user: User = Depends(get_current_user)) -> Optional[int]:
    """Get the branch_id for a teacher. Returns None for admin (full access)."""
    if user.role.value == "admin":
        return None
    return user.branch_id


class DepartmentFilter:
    """Helper class for filtering queries by department."""
    
    def __init__(self, user: User):
        self.user = user
        self.is_admin = user.role.value == "ADMIN"
        self.branch_id = user.branch_id
    
    def filter_timetable_query(self, query, timetable_model):
        """Filter timetable query by teacher's branch."""
        if self.is_admin:
            return query
        return query.filter(timetable_model.branch_id == self.branch_id)
    
    def filter_attendance_query(self, query, attendance_model, timetable_model):
        """Filter attendance query by teacher's branch."""
        if self.is_admin:
            return query
        return query.join(timetable_model).filter(timetable_model.branch_id == self.branch_id)
