"""
OTP (One-Time-Password) management router.

Endpoints:
  POST /api/v1/otp/generate/{timetable_id}  — generate a new OTP
  GET  /api/v1/otp/current/{timetable_id}   — get the current active OTP
  POST /api/v1/otp/refresh/{timetable_id}   — invalidate and issue a new OTP
"""

import random
import string
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.response import success_response
from app.database.otp_code import OTPCode
from app.database.timetables import Timetable
from app.database.user import User
from app.security.permissions import UserRole, require_role
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/otp", tags=["OTP Codes"])

_DEFAULT_TTL_MINUTES = 5
_OTP_LENGTH = 6


def _make_otp() -> str:
    """Return a random *_OTP_LENGTH*-digit numeric string."""
    return "".join(random.choices(string.digits, k=_OTP_LENGTH))


def _serialize_otp(otp: OTPCode) -> dict:
    return {
        "id": otp.id,
        "timetable_id": otp.timetable_id,
        "code": otp.code,
        "created_at": otp.created_at.isoformat() if otp.created_at else None,
        "expires_at": otp.expires_at.isoformat() if otp.expires_at else None,
        "used_count": otp.used_count,
        "is_expired": otp.expires_at < datetime.utcnow() if otp.expires_at else True,
    }


# ---------------------------------------------------------------------------
# POST /generate/{timetable_id}
# ---------------------------------------------------------------------------

@router.post("/generate/{timetable_id}")
async def generate_otp(
    timetable_id: int,
    request: Request,
    ttl_minutes: int = Query(_DEFAULT_TTL_MINUTES, ge=1, le=60,
                             description="OTP validity in minutes"),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Generate a new OTP for a timetable session.

    Any previously active OTP for the same timetable is expired first.
    """
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You can only generate OTPs for your own timetables")

    now = datetime.utcnow()
    # Expire any still-valid OTPs for this timetable
    db.query(OTPCode).filter(
        OTPCode.timetable_id == timetable_id,
        OTPCode.expires_at > now,
    ).update({"expires_at": now})

    otp = OTPCode(
        timetable_id=timetable_id,
        code=_make_otp(),
        created_at=now,
        expires_at=now + timedelta(minutes=ttl_minutes),
        used_count=0,
    )
    db.add(otp)
    db.commit()
    db.refresh(otp)

    await log_action(
        db,
        action="OTP_GENERATED",
        entity_type="otp_code",
        user_id=current_user.id,
        entity_id=str(otp.id),
        details={"timetable_id": timetable_id, "ttl_minutes": ttl_minutes},
        request=request,
    )

    return success_response(_serialize_otp(otp), "OTP generated successfully")


# ---------------------------------------------------------------------------
# GET /current/{timetable_id}
# ---------------------------------------------------------------------------

@router.get("/current/{timetable_id}")
async def get_current_otp(
    timetable_id: int,
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Return the most recent non-expired OTP for a timetable."""
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You are not the teacher for this timetable")

    now = datetime.utcnow()
    otp = (
        db.query(OTPCode)
        .filter(OTPCode.timetable_id == timetable_id, OTPCode.expires_at > now)
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    if not otp:
        raise NotFoundError("No active OTP found for this timetable")

    return success_response(_serialize_otp(otp))


# ---------------------------------------------------------------------------
# POST /refresh/{timetable_id}
# ---------------------------------------------------------------------------

@router.post("/refresh/{timetable_id}")
async def refresh_otp(
    timetable_id: int,
    request: Request,
    ttl_minutes: int = Query(_DEFAULT_TTL_MINUTES, ge=1, le=60),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Invalidate the current OTP and issue a fresh one."""
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You are not the teacher for this timetable")

    now = datetime.utcnow()
    db.query(OTPCode).filter(
        OTPCode.timetable_id == timetable_id,
        OTPCode.expires_at > now,
    ).update({"expires_at": now})

    otp = OTPCode(
        timetable_id=timetable_id,
        code=_make_otp(),
        created_at=now,
        expires_at=now + timedelta(minutes=ttl_minutes),
        used_count=0,
    )
    db.add(otp)
    db.commit()
    db.refresh(otp)

    await log_action(
        db,
        action="OTP_REFRESHED",
        entity_type="otp_code",
        user_id=current_user.id,
        entity_id=str(otp.id),
        details={"timetable_id": timetable_id},
        request=request,
    )

    return success_response(_serialize_otp(otp), "OTP refreshed successfully")
