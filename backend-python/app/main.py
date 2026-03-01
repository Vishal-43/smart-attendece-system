from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
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
    auth,
    attendance,
    batches,
    branches,
    codes,
    courses,
    divisions,
    enrollments,
    locations,
    timetable,
    users,
)
from app.routers import health, otp, qr_code

app = FastAPI(
    title="Smart Attendance System",
    description="Attendance Tracking with QR codes and OTP",
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(batches.router)
app.include_router(branches.router)
app.include_router(codes.router)
app.include_router(courses.router)
app.include_router(divisions.router)
app.include_router(enrollments.router)
app.include_router(locations.router)
app.include_router(timetable.router)
app.include_router(users.router)

app.include_router(qr_code.router)
app.include_router(otp.router)


@app.get("/")
def root():
    return {"message": "Smart Attendance System API v2"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
