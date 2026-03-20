import os
import json
import logging
import time
import uuid
from collections import defaultdict, deque
from urllib.parse import urlparse

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
    conflict_handler,
    forbidden_handler,
    generic_handler,
    integrity_handler,
    not_found_handler,
    unauthorized_handler,
    validation_handler,
)
from app.routers import (
    access_points,
    auth,
    attendance,
    batches,
    branches,
    codes,
    courses,
    dashboard,
    divisions,
    enrollments,
    locations,
    notifications,
    reports,
    timetable,
    users,
)
from app.routers import health, otp, qr_code, realtime

app = FastAPI(
    title="Smart Attendance System",
    description="Attendance Tracking with QR codes and OTP",
    version="2.0.0",
)

logger = logging.getLogger("smartattendance.request")


def _load_allowed_origins() -> list[str]:
    raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
    allowed_origins: list[str] = []
    has_wildcard = False
    for origin in [item.strip() for item in raw_origins.split(",") if item.strip()]:
        if origin == "*":
            allowed_origins.append(origin)
            has_wildcard = True
            continue
        parsed = urlparse(origin)
        if parsed.scheme in {"http", "https"} and parsed.netloc:
            allowed_origins.append(origin)
            continue
        logger.warning("Invalid origin skipped: %s", origin)

    if not allowed_origins:
        allowed_origins = ["http://localhost:5173", "http://localhost:3000"]
    
    if has_wildcard:
        logger.warning(
            "CORS wildcard (*) is set. This is insecure for production."
        )
    
    return allowed_origins


allowed_origins = _load_allowed_origins()

_rate_limit_buckets: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def _resolve_limit(path: str) -> tuple[str, int]:
    if path.startswith("/api/v1/qr/generate") or path.startswith("/api/v1/otp/generate"):
        return ("code_generation", 30)
    if path.startswith("/api/v1/auth"):
        return ("auth", 60)
    return ("general", 120)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_and_rate_limit(request: Request, call_next):
    started = time.perf_counter()
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    client_ip = request.client.host if request.client else "unknown"
    bucket_name, limit = _resolve_limit(request.url.path)
    key = (client_ip, bucket_name)
    now = time.time()
    bucket = _rate_limit_buckets[key]

    while bucket and now - bucket[0] > 60:
        bucket.popleft()

    if len(bucket) >= limit:
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "message": "Rate limit exceeded",
                "data": {"bucket": bucket_name, "limit": limit},
            },
            headers={"x-request-id": request_id},
        )

    bucket.append(now)

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        logger.exception(
            json.dumps(
                {
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "client_ip": client_ip,
                }
            )
        )
        raise

    duration_ms = round((time.perf_counter() - started) * 1000, 2)
    logger.info(
        json.dumps(
            {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client_ip": client_ip,
            }
        )
    )
    response.headers["x-request-id"] = request_id
    return response

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------
app.add_exception_handler(NotFoundError, not_found_handler)
app.add_exception_handler(ConflictError, conflict_handler)
app.add_exception_handler(ForbiddenError, forbidden_handler)
app.add_exception_handler(UnauthorizedError, unauthorized_handler)
app.add_exception_handler(ValidationError, validation_handler)
app.add_exception_handler(RequestValidationError, validation_handler)
app.add_exception_handler(IntegrityError, integrity_handler)
app.add_exception_handler(Exception, generic_handler)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health.router)   # GET /health  (no version prefix)

app.include_router(access_points.router)
app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(batches.router)
app.include_router(branches.router)
app.include_router(codes.router)
app.include_router(courses.router)
app.include_router(dashboard.router)
app.include_router(divisions.router)
app.include_router(enrollments.router)
app.include_router(locations.router)
app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(timetable.router)
app.include_router(users.router)

app.include_router(qr_code.router)
app.include_router(otp.router)
app.include_router(realtime.router)


@app.get("/")
def root():
    return {"message": "Smart Attendance System API v2"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
