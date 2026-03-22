"""
QR Code management router.

Endpoints:
  POST /api/v1/qr/generate/{timetable_id}   — generate (or rotate) a QR code for a session
  GET  /api/v1/qr/current/{timetable_id}    — get the current active QR code
  POST /api/v1/qr/refresh/{timetable_id}    — invalidate and issue a new code
"""

import base64
import io
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import qrcode
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.core.config import settings
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.redis_service import redis_service
from app.core.response import success_response
from app.database.qr_codes import QRCode, CodeStatus
from app.database.timetables import Timetable
from app.database.user import User
from app.security.permissions import UserRole, require_role
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/qr", tags=["QR Codes"])

QR_REDIS_KEY = "qr:active:{timetable_id}"


def _generate_qr_image(data: str, timetable_id: int) -> str:
    """Render *data* as a QR code and return a base64-encoded PNG string."""
    qr_payload = json.dumps({"code": data, "timetable_id": timetable_id})
    img = qrcode.make(qr_payload)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _serialize_qr(qr: QRCode, include_image: bool = False) -> dict:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    remaining_seconds = 0
    if qr.expires_at:
        remaining = (qr.expires_at - now).total_seconds()
        remaining_seconds = max(0, int(remaining))
    
    def to_utc_iso(dt):
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.isoformat() + 'Z'
        return dt.isoformat()
    
    payload = {
        "id": qr.id,
        "timetable_id": qr.timetable_id,
        "code": qr.code,
        "created_at": to_utc_iso(qr.created_at),
        "expires_at": to_utc_iso(qr.expires_at),
        "expires_in": remaining_seconds,
        "used_count": qr.used_count,
        "status": qr.status.value if qr.status else "active",
        "is_expired": qr.expires_at < now if qr.expires_at else True,
    }
    if include_image:
        payload["qr_image_base64"] = _generate_qr_image(qr.code, qr.timetable_id)
    return payload


# ---------------------------------------------------------------------------
# POST /generate/{timetable_id}
# ---------------------------------------------------------------------------

@router.post("/generate/{timetable_id}")
async def generate_qr_code(
    timetable_id: int,
    request: Request,
    ttl_minutes: int = Query(settings.QR_DEFAULT_TTL_MINUTES, ge=1, le=120,
                             description="Code validity in minutes"),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Generate a new QR code for a timetable session.

    - Teachers may only generate codes for their own timetables.
    - If a still-valid code already exists it is returned as-is; pass
      `?ttl_minutes=…` with ``refresh=true`` query param to force a new one.
    """
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You can only generate codes for your own timetables")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    db.query(QRCode).filter(
        QRCode.timetable_id == timetable_id,
        QRCode.expires_at > now,
    ).update({"expires_at": now})

    code_value = secrets.token_urlsafe(24)
    qr = QRCode(
        timetable_id=timetable_id,
        code=code_value,
        created_at=now,
        expires_at=now + timedelta(minutes=ttl_minutes),
        used_count=0,
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)

    qr_payload = json.dumps({"code": code_value, "timetable_id": timetable_id})
    redis_key = QR_REDIS_KEY.format(timetable_id=timetable_id)
    ttl_seconds = (qr.expires_at - now).total_seconds()
    redis_service.set_json(redis_key, _serialize_qr(qr), ex_seconds=int(ttl_seconds))

    await log_action(
        db,
        action="QR_CODE_GENERATED",
        entity_type="qr_code",
        user_id=current_user.id,
        entity_id=str(qr.id),
        details={"timetable_id": timetable_id, "ttl_minutes": ttl_minutes},
        request=request,
    )

    return success_response(_serialize_qr(qr, include_image=True), "QR code generated")


# ---------------------------------------------------------------------------
# GET /current/{timetable_id}  (teachers/admins only)
# ---------------------------------------------------------------------------

@router.get("/current/{timetable_id}")
async def get_current_qr(
    timetable_id: int,
    with_image: bool = Query(False, description="Include base64 PNG image"),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Return the most recent non-expired QR code for a timetable."""
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You are not the teacher for this timetable")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    qr = (
        db.query(QRCode)
        .filter(QRCode.timetable_id == timetable_id, QRCode.expires_at > now)
        .order_by(QRCode.created_at.desc())
        .first()
    )
    if not qr:
        raise NotFoundError("No active QR code found for this timetable")

    redis_key = QR_REDIS_KEY.format(timetable_id=timetable_id)
    ttl_seconds = (qr.expires_at - now).total_seconds()
    redis_service.set_json(redis_key, _serialize_qr(qr), ex_seconds=int(ttl_seconds))

    return success_response(_serialize_qr(qr, include_image=with_image))


# ---------------------------------------------------------------------------
# GET /status/{timetable_id}  (students can check if session is active)
# ---------------------------------------------------------------------------

@router.get("/status/{timetable_id}")
async def get_qr_status(
    timetable_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return QR session status for students (without exposing the code)."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    qr = (
        db.query(QRCode)
        .filter(QRCode.timetable_id == timetable_id, QRCode.expires_at > now)
        .order_by(QRCode.created_at.desc())
        .first()
    )
    
    if not qr:
        return success_response({"has_active": False, "expires_in": 0})
    
    remaining = int((qr.expires_at - now).total_seconds())
    return success_response({
        "has_active": True,
        "expires_in": remaining,
        "expires_at": qr.expires_at.isoformat() + 'Z' if qr.expires_at else None,
    })


# ---------------------------------------------------------------------------
# POST /refresh/{timetable_id}
# ---------------------------------------------------------------------------

@router.post("/refresh/{timetable_id}")
async def refresh_qr_code(
    timetable_id: int,
    request: Request,
    ttl_minutes: int = Query(settings.QR_DEFAULT_TTL_MINUTES, ge=1, le=120),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Invalidate the current QR code and issue a fresh one."""
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You can only generate codes for your own timetables")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    db.query(QRCode).filter(
        QRCode.timetable_id == timetable_id,
        QRCode.expires_at > now,
    ).update({"expires_at": now})

    code_value = secrets.token_urlsafe(24)
    qr = QRCode(
        timetable_id=timetable_id,
        code=code_value,
        created_at=now,
        expires_at=now + timedelta(minutes=ttl_minutes),
        used_count=0,
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)

    redis_key = QR_REDIS_KEY.format(timetable_id=timetable_id)
    ttl_seconds = (qr.expires_at - now).total_seconds()
    redis_service.set_json(redis_key, _serialize_qr(qr), ex_seconds=int(ttl_seconds))

    await log_action(
        db,
        action="QR_CODE_REFRESHED",
        entity_type="qr_code",
        user_id=current_user.id,
        entity_id=str(qr.id),
        details={"timetable_id": timetable_id},
        request=request,
    )

    return success_response(_serialize_qr(qr, include_image=True), "QR code refreshed")


# ---------------------------------------------------------------------------
# DELETE /{qr_id}  — cancel a QR session
# ---------------------------------------------------------------------------

@router.delete("/{qr_id}")
async def cancel_qr_code(
    qr_id: int,
    request: Request,
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Cancel an active QR code session immediately."""
    qr = db.query(QRCode).filter(QRCode.id == qr_id).first()
    if not qr:
        raise NotFoundError("QR code not found")

    timetable = db.query(Timetable).filter(Timetable.id == qr.timetable_id).first()
    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You can only cancel codes for your own timetables")

    qr.status = CodeStatus.CANCELLED
    qr.expires_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()

    redis_key = QR_REDIS_KEY.format(timetable_id=qr.timetable_id)
    redis_service.delete(redis_key)

    await log_action(
        db,
        action="QR_CODE_CANCELLED",
        entity_type="qr_code",
        user_id=current_user.id,
        entity_id=str(qr.id),
        details={"timetable_id": qr.timetable_id},
        request=request,
    )

    return success_response(_serialize_qr(qr), "QR code cancelled")


# ---------------------------------------------------------------------------
# DELETE /cancel/{timetable_id}  — cancel QR session by timetable_id
# ---------------------------------------------------------------------------

@router.delete("/cancel/{timetable_id}")
async def cancel_qr_by_timetable(
    timetable_id: int,
    request: Request,
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Cancel an active QR code session by timetable ID."""
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You can only cancel codes for your own timetables")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    qr = (
        db.query(QRCode)
        .filter(QRCode.timetable_id == timetable_id, QRCode.expires_at > now)
        .order_by(QRCode.created_at.desc())
        .first()
    )
    
    if qr:
        qr.status = CodeStatus.CANCELLED
        qr.expires_at = now
        db.commit()
        
        redis_key = QR_REDIS_KEY.format(timetable_id=timetable_id)
        redis_service.delete(redis_key)

        await log_action(
            db,
            action="QR_CODE_CANCELLED",
            entity_type="qr_code",
            user_id=current_user.id,
            entity_id=str(qr.id),
            details={"timetable_id": timetable_id},
            request=request,
        )
        
        return success_response({"cancelled": True, "qr_id": qr.id}, "QR session cancelled")
    
    return success_response({"cancelled": False}, "No active QR session found")
