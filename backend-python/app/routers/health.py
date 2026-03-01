from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.response import success_response, error_response

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Liveness / readiness probe.
    Checks DB connectivity and returns service metadata.
    """
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        return JSONResponse(
            status_code=503,
            content=error_response(
                "Service is degraded",
                data={
                    "status": "degraded",
                    "database": db_status,
                    "version": "1.0.0",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            ),
        )

    return JSONResponse(
        status_code=200,
        content=success_response(
            message="Service is healthy",
            data={
                "status": "ok",
                "database": db_status,
                "version": "1.0.0",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        ),
    )
