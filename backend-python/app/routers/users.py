import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import get_current_user, get_db, require_admin
from app.core.response import success_response
from app.schemas.auth import PasswordChangeRequest
from app.schemas.user_preferences import UserPreferencesOut, UserPreferencesUpdate
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.database.user_preferences import UserPreferences
from app.database.user import User
from app.database.password_reset_tokens import PasswordResetToken
from app.database.notifications import Notification
from app.database.student_enrollments import StudentEnrollment
from app.security.password import hash_password, verify_password

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/users", tags=["users"])


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "role": user.role.value,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }


def _serialize_prefs(prefs: UserPreferences) -> dict:
    return {
        "id": prefs.id,
        "user_id": prefs.user_id,
        "theme": prefs.theme.value if prefs.theme else "system",
        "notification_email": prefs.notification_email,
        "language": prefs.language.value if prefs.language else "en",
        "created_at": prefs.created_at.isoformat() if prefs.created_at else None,
        "updated_at": prefs.updated_at.isoformat() if prefs.updated_at else None,
    }


@router.get("")
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    users = db.query(User).all()
    return success_response([_serialize_user(u) for u in users], "Users retrieved successfully")


@router.get("/{user_id}")
def get_user(
    user_id: int, db: Session = Depends(get_db), curr_user=Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if curr_user.role.value != "ADMIN" and curr_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user",
        )
    return success_response(_serialize_user(user), "User retrieved successfully")


@router.post("")
def create_user(user_in: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    new_user = User(
        email=user_in.email,
        username=user_in.username,
        password_hash=hash_password(user_in.password, user_in.username),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone,
        role=user_in.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return success_response(_serialize_user(new_user), "User created successfully", 201)


@router.put("/{user_id}")
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    curr_user=Depends(get_current_user),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if curr_user.role.value != "ADMIN" and curr_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    update_data = user_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "password":
            db_user.password_hash = hash_password(value, db_user.username)
        else:
            setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return success_response(_serialize_user(db_user), "User updated successfully")


@router.put("/{user_id}/password")
def update_user_password(
    user_id: int,
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    curr_user=Depends(get_current_user),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if curr_user.role.value != "ADMIN" and curr_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Admins can change any user's password without verifying old password
    # Users changing their own password must verify old password
    if curr_user.role.value != "ADMIN":
        if not verify_password(payload.old_password, db_user.password_hash, db_user.username):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is invalid")

    db_user.password_hash = hash_password(payload.new_password, db_user.username)
    db.commit()

    return success_response(None, "Password updated successfully")


@router.get("/{user_id}/preferences")
def get_user_preferences(
    user_id: int,
    db: Session = Depends(get_db),
    curr_user=Depends(get_current_user),
):
    if curr_user.role.value != "ADMIN" and curr_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
    if not prefs:
        prefs = UserPreferences(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return success_response(_serialize_prefs(prefs), "Preferences retrieved successfully")


@router.put("/{user_id}/preferences")
def update_user_preferences(
    user_id: int,
    payload: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    curr_user=Depends(get_current_user),
):
    if curr_user.role.value != "ADMIN" and curr_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
    if not prefs:
        prefs = UserPreferences(user_id=user_id)
        db.add(prefs)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prefs, key, value)

    db.commit()
    db.refresh(prefs)
    return success_response(_serialize_prefs(prefs), "Preferences updated successfully")


@router.delete("/{user_id}")
def delete_user(
    user_id: int, db: Session = Depends(get_db), curr_user=Depends(get_current_user)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if curr_user.role.value != "ADMIN" and curr_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
        
    try:
        # Cascade delete auxiliary tables that safely can be removed
        db.query(UserPreferences).filter(UserPreferences.user_id == user_id).delete(synchronize_session=False)
        db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete(synchronize_session=False)
        db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
        db.query(StudentEnrollment).filter(StudentEnrollment.student_id == user_id).delete(synchronize_session=False)
        
        db.delete(db_user)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user. They have associated attendance records or timetables.",
        )
    
    return success_response(None, "User deleted successfully", 200)
