from datetime import datetime, date
from typing import Optional
import math

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.core.exceptions import NotFoundError, ConflictError, ForbiddenError, ValidationError
from app.core.response import success_response
from app.database.attendance_records import AttendanceRecord, AttendanceStatus
from app.database.qr_codes import QRCode
from app.database.otp_code import OTPCode
from app.database.timetables import Timetable
from app.database.locations import Location
from app.database.student_enrollments import StudentEnrollment, EnrollmentStatus
from app.database.user import User
from app.security.permissions import UserRole, require_role
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/attendance", tags=["Attendance Records"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in metres between two WGS-84 coordinates."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _serialize_record(r: AttendanceRecord) -> dict:
    return {
        "id": r.id,
        "timetable_id": r.timetable_id,
        "student_id": r.student_id,
        "enrollment_id": r.enrollment_id,
        "teacher_id": r.teacher_id,
        "division_id": r.division_id,
        "batch_id": r.batch_id,
        "location_id": r.location_id,
        "marked_at": r.marked_at.isoformat() if r.marked_at else None,
        "status": r.status.value if r.status else None,
        "device_info": r.device_info,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


# ---------------------------------------------------------------------------
# POST /mark  —  student self-marks attendance via QR or OTP code
# ---------------------------------------------------------------------------

@router.post("/mark")
async def mark_attendance(
    request: Request,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Body JSON fields:
      timetable_id  int        required
      method        str        "qr" | "otp"
      code          str        the code value
      latitude      float      optional – user GPS lat
      longitude     float      optional – user GPS lon
      device_info   str        optional
    """
    body = await request.json()

    timetable_id: Optional[int] = body.get("timetable_id")
    method: Optional[str] = body.get("method")
    code: Optional[str] = body.get("code")
    user_lat: Optional[float] = body.get("latitude")
    user_lon: Optional[float] = body.get("longitude")
    device_info: Optional[str] = body.get("device_info")

    if not timetable_id or not method or not code:
        raise ValidationError("timetable_id, method, and code are required")

    if method not in ("qr", "otp"):
        raise ValidationError("method must be 'qr' or 'otp'")

    # 1. Timetable exists and is active
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")
    if not timetable.is_active:
        raise ForbiddenError("This timetable session is not active")

    # 2. Student is enrolled in the timetable's division
    enrollment = (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.student_id == current_user.id,
            StudentEnrollment.division_id == timetable.division_id,
            StudentEnrollment.status == EnrollmentStatus.ACTIVE,
        )
        .first()
    )
    if not enrollment:
        raise ForbiddenError("You are not enrolled in this division")

    # 3. No duplicate attendance for today's session
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    duplicate = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.timetable_id == timetable_id,
            AttendanceRecord.student_id == current_user.id,
            AttendanceRecord.marked_at >= today_start,
        )
        .first()
    )
    if duplicate:
        raise ConflictError("Attendance already marked for this session today")

    # 4. Validate code and expiry
    now = datetime.utcnow()
    if method == "qr":
        entry = (
            db.query(QRCode)
            .filter(QRCode.timetable_id == timetable_id, QRCode.code == code)
            .first()
        )
    else:
        entry = (
            db.query(OTPCode)
            .filter(OTPCode.timetable_id == timetable_id, OTPCode.code == code)
            .first()
        )

    if not entry:
        raise ValidationError("Invalid code")
    if entry.expires_at < now:
        raise ValidationError("Code has expired")

    # 5. Geofencing (if location has coordinates and student provided coordinates)
    location: Optional[Location] = None
    if timetable.location_id:
        location = db.query(Location).filter(Location.id == timetable.location_id).first()

    if location and location.latitude and location.longitude and location.radius:
        if user_lat is None or user_lon is None:
            raise ValidationError("GPS coordinates required for this session")
        distance = _haversine_distance(user_lat, user_lon, location.latitude, location.longitude)
        if distance > location.radius:
            raise ForbiddenError(
                f"You are {distance:.0f}m away from the session location (max {location.radius}m)"
            )

    # 6. Create attendance record
    record = AttendanceRecord(
        timetable_id=timetable_id,
        student_id=current_user.id,
        enrollment_id=enrollment.id,
        teacher_id=timetable.teacher_id,
        division_id=timetable.division_id,
        batch_id=timetable.batch_id,
        location_id=timetable.location_id,
        marked_at=now,
        status=AttendanceStatus.PRESENT,
        device_info=device_info,
    )
    db.add(record)
    entry.used_count = (entry.used_count or 0) + 1
    db.commit()
    db.refresh(record)

    await log_action(
        db,
        action="ATTENDANCE_MARKED",
        entity_type="attendance_record",
        user_id=current_user.id,
        entity_id=str(record.id),
        details={"timetable_id": timetable_id, "method": method},
        request=request,
    )

    return success_response(_serialize_record(record), "Attendance marked successfully")


# ---------------------------------------------------------------------------
# GET /history/{user_id}  —  paginated attendance history
# ---------------------------------------------------------------------------

@router.get("/history/{user_id}")
async def get_attendance_history(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    timetable_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Students can only view their own history; teachers and admins can view any."""
    if current_user.role == UserRole.STUDENT and current_user.id != user_id:
        raise ForbiddenError("You can only view your own attendance history")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise NotFoundError("User not found")

    q = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == user_id)

    if timetable_id:
        q = q.filter(AttendanceRecord.timetable_id == timetable_id)
    if start_date:
        q = q.filter(AttendanceRecord.marked_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        q = q.filter(AttendanceRecord.marked_at <= datetime.combine(end_date, datetime.max.time()))

    total = q.count()
    records = (
        q.order_by(AttendanceRecord.marked_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return success_response(
        {
            "items": [_serialize_record(r) for r in records],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": math.ceil(total / limit) if total > 0 else 0,
        }
    )


# ---------------------------------------------------------------------------
# GET /session/{timetable_id}  —  all records for a session (teacher/admin)
# ---------------------------------------------------------------------------

@router.get("/session/{timetable_id}")
async def get_session_attendance(
    timetable_id: int,
    session_date: Optional[date] = Query(None, description="Filter by date (YYYY-MM-DD). Defaults to today."),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You are not the teacher for this timetable")

    target_date = session_date or date.today()
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = datetime.combine(target_date, datetime.max.time())

    records = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.timetable_id == timetable_id,
            AttendanceRecord.marked_at >= day_start,
            AttendanceRecord.marked_at <= day_end,
        )
        .order_by(AttendanceRecord.marked_at.asc())
        .all()
    )

    return success_response(
        {
            "timetable_id": timetable_id,
            "date": target_date.isoformat(),
            "total_present": len(records),
            "records": [_serialize_record(r) for r in records],
        }
    )


# ---------------------------------------------------------------------------
# PUT /{attendance_id}  —  update status (teacher/admin)
# ---------------------------------------------------------------------------

@router.put("/{attendance_id}")
async def update_attendance_record(
    attendance_id: int,
    request: Request,
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Body JSON fields: status  str  'present' | 'absent' | 'late'"""
    body = await request.json()
    new_status_str: Optional[str] = body.get("status")

    if not new_status_str:
        raise ValidationError("status is required")

    valid_statuses = {s.value for s in AttendanceStatus}
    if new_status_str not in valid_statuses:
        raise ValidationError(f"status must be one of: {', '.join(valid_statuses)}")

    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == attendance_id).first()
    if not record:
        raise NotFoundError("Attendance record not found")

    if current_user.role == UserRole.TEACHER:
        timetable = db.query(Timetable).filter(Timetable.id == record.timetable_id).first()
        if timetable and timetable.teacher_id != current_user.id:
            raise ForbiddenError("You can only update attendance for your own sessions")

    old_status = record.status.value if record.status else None
    record.status = AttendanceStatus(new_status_str)
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)

    await log_action(
        db,
        action="ATTENDANCE_UPDATED",
        entity_type="attendance_record",
        user_id=current_user.id,
        entity_id=str(record.id),
        details={"old_status": old_status, "new_status": new_status_str},
        request=request,
    )

    return success_response(_serialize_record(record), "Attendance record updated")


# ---------------------------------------------------------------------------
# GET /  —  list all records (admin only, paginated)
# ---------------------------------------------------------------------------

@router.get("/")
def list_attendance_records(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    total = db.query(AttendanceRecord).count()
    records = (
        db.query(AttendanceRecord)
        .order_by(AttendanceRecord.marked_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return success_response(
        {
            "items": [_serialize_record(r) for r in records],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": math.ceil(total / limit) if total > 0 else 0,
        }
    )
