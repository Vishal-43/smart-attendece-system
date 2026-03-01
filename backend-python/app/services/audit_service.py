import logging
from typing import Optional

from fastapi import Request
from sqlalchemy.orm import Session

from app.database.audit_log import AuditLog

logger = logging.getLogger(__name__)


async def log_action(
    db: Session,
    action: str,
    entity_type: str,
    user_id: Optional[int] = None,
    entity_id: Optional[str] = None,
    details: Optional[dict] = None,
    request: Optional[Request] = None,
) -> None:
    """
    Persist an audit log entry.  Never raises — failures are logged and swallowed
    so they don't disrupt the caller.
    """
    try:
        ip_address: Optional[str] = None
        if request is not None:
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                ip_address = forwarded_for.split(",")[0].strip()
            else:
                ip_address = getattr(request.client, "host", None)

        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            details=details,
            ip_address=ip_address,
        )
        db.add(entry)
        db.commit()
    except Exception as exc:  # pragma: no cover
        logger.error("Failed to write audit log: %s", exc, exc_info=True)
