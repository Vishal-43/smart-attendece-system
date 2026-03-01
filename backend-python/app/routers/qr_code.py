"""
QR Code management router.

Endpoints:
  POST /api/v1/qr/generate/{timetable_id}   — generate (or rotate) a QR code for a session
  GET  /api/v1/qr/current/{timetable_id}    — get the current active QR code
  POST /api/v1/qr/refresh/{timetable_id}    — invalidate and issue a new code
"""

import base64
import io
import secrets
from datetime import datetime, timedelta
from typing import Optional

import qrcode
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.response import success_response
from app.database.qr_codes import QRCode
from app.database.timetables import Timetable
from app.database.user import User
from app.security.permissions import UserRole, require_role
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/qr", tags=["QR Codes"])

# Default code validity in minutes
_DEFAULT_TTL_MINUTES = 10


def _generate_qr_image(data: str) -> str:
    """Render *data* as a QR code and return a base64-encoded PNG string."""
    img = qrcode.make(data)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _serialize_qr(qr: QRCode, include_image: bool = False) -> dict:
    payload = {
        "id": qr.id,
        "timetable_id": qr.timetable_id,
        "code": qr.code,
        "created_at": qr.created_at.isoformat() if qr.created_at else None,
        "expires_at": qr.expires_at.isoformat() if qr.expires_at else None,
        "used_count": qr.used_count,
        "is_expired": qr.expires_at < datetime.utcnow() if qr.expires_at else True,
    }
    if include_image:
        payload["qr_image_base64"] = _generate_qr_image(qr.code)
    return payload


# ---------------------------------------------------------------------------
# POST /generate/{timetable_id}
# ---------------------------------------------------------------------------

@router.post("/generate/{timetable_id}")
async def generate_qr_code(
    timetable_id: int,
    request: Request,
    ttl_minutes: int = Query(_DEFAULT_TTL_MINUTES, ge=1, le=120,
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

    now = datetime.utcnow()
    # Expire any existing codes for this timetable
    db.query(QRCode).filter(
        QRCode.timetable_id == timetable_id,
        QRCode.expires_at > now,
    ).update({"expires_at": now})

    code_value = secrets.token_urlsafe(32)
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
# GET /current/{timetable_id}
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

    now = datetime.utcnow()
    qr = (
        db.query(QRCode)
        .filter(QRCode.timetable_id == timetable_id, QRCode.expires_at > now)
        .order_by(QRCode.created_at.desc())
        .first()
    )
    if not qr:
        raise NotFoundError("No active QR code found for this timetable")

    return success_response(_serialize_qr(qr, include_image=with_image))


# ---------------------------------------------------------------------------
# POST /refresh/{timetable_id}
# ---------------------------------------------------------------------------

@router.post("/refresh/{timetable_id}")
async def refresh_qr_code(
    timetable_id: int,
    request: Request,
    ttl_minutes: int = Query(_DEFAULT_TTL_MINUTES, ge=1, le=120),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Invalidate the current QR code and issue a fresh one."""
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You are not the teacher for this timetable")

    now = datetime.utcnow()
    # Expire existing codes
    db.query(QRCode).filter(
        QRCode.timetable_id == timetable_id,
        QRCode.expires_at > now,
    ).update({"expires_at": now})

    code_value = secrets.token_urlsafe(32)
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
