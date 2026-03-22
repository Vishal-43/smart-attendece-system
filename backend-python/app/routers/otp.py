"""
OTP (One-Time-Password) management router.

Endpoints:
  POST /api/v1/otp/generate/{timetable_id}  — generate a new OTP
  GET  /api/v1/otp/current/{timetable_id}   — get the current active OTP
  POST /api/v1/otp/refresh/{timetable_id}   — invalidate and issue a new OTP
"""

import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.core.config import settings
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.redis_service import redis_service
from app.core.response import success_response
from app.database.otp_code import OTPCode
from app.database.timetables import Timetable
from app.database.user import User
from app.security.permissions import UserRole, require_role
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/otp", tags=["OTP Codes"])

OTP_REDIS_KEY = "otp:active:{timetable_id}"


def _make_otp() -> str:
    """Return a random OTP_LENGTH-digit numeric string."""
    return "".join(random.choices(string.digits, k=settings.OTP_LENGTH))


def _serialize_otp(otp: OTPCode) -> dict:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    remaining_seconds = 0
    if otp.expires_at:
        remaining = (otp.expires_at - now).total_seconds()
        remaining_seconds = max(0, int(remaining))
    
    def to_utc_iso(dt):
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.isoformat() + 'Z'
        return dt.isoformat()
    
    return {
        "id": otp.id,
        "timetable_id": otp.timetable_id,
        "code": otp.code,
        "created_at": to_utc_iso(otp.created_at),
        "expires_at": to_utc_iso(otp.expires_at),
        "expires_in": remaining_seconds,
        "used_count": otp.used_count,
        "status": otp.status or "active",
        "is_expired": otp.expires_at < now if otp.expires_at else True,
    }


# ---------------------------------------------------------------------------
# POST /generate/{timetable_id}
# ---------------------------------------------------------------------------

@router.post("/generate/{timetable_id}")
async def generate_otp(
    timetable_id: int,
    request: Request,
    ttl_minutes: int = Query(settings.OTP_DEFAULT_TTL_MINUTES, ge=1, le=60,
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

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    db.query(OTPCode).filter(
        OTPCode.timetable_id == timetable_id,
        OTPCode.expires_at > now,
    ).update({"expires_at": now})

    now = datetime.now(timezone.utc).replace(tzinfo=None)
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

    redis_key = OTP_REDIS_KEY.format(timetable_id=timetable_id)
    ttl_seconds = (otp.expires_at - now).total_seconds()
    redis_service.set_json(redis_key, _serialize_otp(otp), ex_seconds=int(ttl_seconds))

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
        raise ForbiddenError("You can only generate OTPs for your own timetables")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    otp = (
        db.query(OTPCode)
        .filter(OTPCode.timetable_id == timetable_id, OTPCode.expires_at > now)
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    if not otp:
        raise NotFoundError("No active OTP found for this timetable")

    redis_key = OTP_REDIS_KEY.format(timetable_id=timetable_id)
    ttl_seconds = (otp.expires_at - now).total_seconds()
    redis_service.set_json(redis_key, _serialize_otp(otp), ex_seconds=int(ttl_seconds))

    return success_response(_serialize_otp(otp))


# ---------------------------------------------------------------------------
# GET /status/{timetable_id}  (students can check if session is active)
# ---------------------------------------------------------------------------

@router.get("/status/{timetable_id}")
async def get_otp_status(
    timetable_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return OTP session status for students (without exposing the code)."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    otp = (
        db.query(OTPCode)
        .filter(OTPCode.timetable_id == timetable_id, OTPCode.expires_at > now)
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    
    if not otp:
        return success_response({"has_active": False, "expires_in": 0})
    
    remaining = int((otp.expires_at - now).total_seconds())
    return success_response({
        "has_active": True,
        "expires_in": remaining,
        "expires_at": otp.expires_at.isoformat() + 'Z' if otp.expires_at else None,
    })


# ---------------------------------------------------------------------------
# POST /refresh/{timetable_id}
# ---------------------------------------------------------------------------

@router.post("/refresh/{timetable_id}")
async def refresh_otp(
    timetable_id: int,
    request: Request,
    ttl_minutes: int = Query(settings.OTP_DEFAULT_TTL_MINUTES, ge=1, le=60),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Invalidate the current OTP and issue a fresh one."""
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You can only generate OTPs for your own timetables")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    db.query(OTPCode).filter(
        OTPCode.timetable_id == timetable_id,
        OTPCode.expires_at > now,
    ).update({"expires_at": now})

    now = datetime.now(timezone.utc).replace(tzinfo=None)
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

    redis_key = OTP_REDIS_KEY.format(timetable_id=timetable_id)
    ttl_seconds = (otp.expires_at - now).total_seconds()
    redis_service.set_json(redis_key, _serialize_otp(otp), ex_seconds=int(ttl_seconds))

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


# ---------------------------------------------------------------------------
# DELETE /{otp_id}  — cancel an OTP session
# ---------------------------------------------------------------------------

@router.delete("/{otp_id}")
async def cancel_otp(
    otp_id: int,
    request: Request,
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Cancel an active OTP session immediately."""
    otp = db.query(OTPCode).filter(OTPCode.id == otp_id).first()
    if not otp:
        raise NotFoundError("OTP not found")

    timetable = db.query(Timetable).filter(Timetable.id == otp.timetable_id).first()
    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You can only cancel OTPs for your own timetables")

    otp.status = "cancelled"
    otp.expires_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()

    redis_key = OTP_REDIS_KEY.format(timetable_id=otp.timetable_id)
    redis_service.delete(redis_key)

    await log_action(
        db,
        action="OTP_CANCELLED",
        entity_type="otp_code",
        user_id=current_user.id,
        entity_id=str(otp.id),
        details={"timetable_id": otp.timetable_id},
        request=request,
    )

    return success_response(_serialize_otp(otp), "OTP cancelled")


# ---------------------------------------------------------------------------
# DELETE /cancel/{timetable_id}  — cancel OTP session by timetable_id
# ---------------------------------------------------------------------------

@router.delete("/cancel/{timetable_id}")
async def cancel_otp_by_timetable(
    timetable_id: int,
    request: Request,
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Cancel an active OTP session by timetable ID."""
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You can only cancel OTPs for your own timetables")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    otp = (
        db.query(OTPCode)
        .filter(OTPCode.timetable_id == timetable_id, OTPCode.expires_at > now)
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    
    if otp:
        otp.status = "cancelled"
        otp.expires_at = now
        db.commit()
        
        redis_key = OTP_REDIS_KEY.format(timetable_id=timetable_id)
        redis_service.delete(redis_key)

        await log_action(
            db,
            action="OTP_CANCELLED",
            entity_type="otp_code",
            user_id=current_user.id,
            entity_id=str(otp.id),
            details={"timetable_id": timetable_id},
            request=request,
        )
        
        return success_response({"cancelled": True, "otp_id": otp.id}, "OTP session cancelled")
    
    return success_response({"cancelled": False}, "No active OTP session found")
