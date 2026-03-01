from enum import Enum
from typing import Callable

from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.database.user import User, UserRole as DBUserRole


class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


def require_role(*roles: UserRole) -> Callable:
    """
    Dependency factory: ensures the current user has one of the required roles.

    Usage:
        @router.delete("/{id}", dependencies=[Depends(require_role(UserRole.ADMIN))])
    """
    def _checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_value = (
            current_user.role.value
            if hasattr(current_user.role, "value")
            else current_user.role
        )
        allowed = [r.value if isinstance(r, UserRole) else r for r in roles]
        if user_role_value not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed)}.",
            )
        return current_user

    return _checker
