from datetime import datetime, date, timezone
from typing import Optional
import math
import logging

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from app.core.dependencies import get_db, get_current_user
from app.core.exceptions import NotFoundError, ConflictError, ForbiddenError, ValidationError
from app.core.response import success_response
from app.database.attendance_records import AttendanceRecord, AttendanceStatus
from app.database.qr_codes import QRCode
from app.database.otp_code import OTPCode
from app.database.timetables import Timetable, DayOfWeek
from app.database.locations import Location
from app.database.access_points import AccessPoint
from app.database.student_enrollments import StudentEnrollment, EnrollmentStatus
from app.database.user import User
from app.database.subjects import Subject
from app.schemas.attendance_records import MarkAttendanceRequest
from app.security.permissions import UserRole, require_role
from app.services.audit_service import log_action
from app.services.attendance_ws import attendance_ws_manager
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/attendance", tags=["Attendance Records"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _serialize_record_with_student(r: AttendanceRecord) -> dict:
    """Serialize record with student info for teacher/admin view."""
    result = _serialize_record(r, include_timetable=True)
    if r.student:
        result["student"] = {
            "id": r.student.id,
            "first_name": r.student.first_name,
            "last_name": r.student.last_name,
            "enrollment_no": getattr(r.student, 'enrollment_no', None),
            "email": r.student.email,
        }
    return result


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in metres between two WGS-84 coordinates."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _serialize_record(r: AttendanceRecord, include_timetable: bool = False) -> dict:
    result = {
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
    
    if include_timetable and r.timetable:
        timetable = r.timetable
        subject = timetable.subject
        result["timetable"] = {
            "id": timetable.id,
            "subject_name": subject.name if subject else None,
            "subject_code": subject.code if subject else None,
            "day_of_week": timetable.day_of_week.value if timetable.day_of_week else None,
            "start_time": timetable.start_time.isoformat() if timetable.start_time else None,
            "end_time": timetable.end_time.isoformat() if timetable.end_time else None,
            "lecture_type": timetable.lecture_type.value if timetable.lecture_type else None,
        }
    
    return result


# ---------------------------------------------------------------------------
# POST /mark  —  student self-marks attendance via QR or OTP code
# ---------------------------------------------------------------------------

@router.post("/mark")
async def mark_attendance(
    request: Request,
    body: MarkAttendanceRequest,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Mark attendance with multi-factor validation:
    1. Code validation (QR/OTP)
    2. Enrollment validation
    3. Duplicate prevention (with row locking)
    4. Geofence validation
    5. WiFi BSSID validation
    
    IMPORTANT: All validations must complete successfully BEFORE creating any record.
    """
    method = body.method
    code = body.code
    user_lat = body.latitude
    user_lon = body.longitude
    bssid = body.bssid
    device_info = body.device_info

    device_info_str = device_info or f"method={method}"
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # =========================================================================
    # PHASE 1: READ-ONLY VALIDATIONS (no database writes)
    # =========================================================================

    # 1. Validate code and get timetable_id FROM the code (not from request body)
    if method == "qr":
        entry = db.query(QRCode).filter(QRCode.code == code).first()
    else:
        entry = db.query(OTPCode).filter(OTPCode.code == code).first()

    if not entry:
        raise ValidationError("Invalid code")
    if entry.expires_at < now:
        raise ValidationError("Code has expired")
    
    # Use timetable_id from the QR/OTP code itself (security fix)
    actual_timetable_id = entry.timetable_id

    # 2. Timetable exists and is active
    timetable = db.query(Timetable).filter(Timetable.id == actual_timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")
    if not timetable.is_active:
        raise ForbiddenError("This timetable session is not active")

    # 3. Student is enrolled in the timetable's division
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

    # 4. Location & GPS/WiFi requirements preprocessing
    location: Optional[Location] = None
    if timetable.location_id:
        location = db.query(Location).filter(Location.id == timetable.location_id).first()

    # Determine what verifications are required
    location_requires_gps = (
        location is not None and 
        location.latitude is not None and 
        location.longitude is not None and 
        location.radius is not None and
        location.radius > 0
    )
    
    registered_aps = []
    if location is not None:
        registered_aps = (
            db.query(AccessPoint)
            .filter(
                AccessPoint.location_id == location.id,
                AccessPoint.is_active == True,
            )
            .all()
        )
    
    location_has_wifi = len(registered_aps) > 0

    # 5. GPS Verification
    if location_requires_gps:
        if user_lat is None or user_lon is None:
            raise ForbiddenError("GPS coordinates required. Please enable location services.")
        
        distance = _haversine_distance(user_lat, user_lon, location.latitude, location.longitude)
        if distance > location.radius:
            raise ForbiddenError(
                f"You are {distance:.0f}m away from the session location (maximum {location.radius}m allowed). "
                f"Please move closer to the classroom."
            )

    # 6. WiFi BSSID Verification - MUST pass if location has registered APs
    if location_has_wifi:
        if not bssid:
            raise ForbiddenError(
                "WiFi connection required. Please connect to the authorized network and try again."
            )
        
        # Check for fake MAC address (Android returns this when it can't get real BSSID)
        fake_mac = "020000000000"
        normalized_bssid_check = bssid.replace(':', '').replace('-', '').upper().strip()
        if normalized_bssid_check == fake_mac:
            raise ForbiddenError(
                "Unable to detect WiFi network. Please ensure you are connected to the authorized WiFi network."
            )
        
        # Normalize BSSID: remove colons/dashes, convert to uppercase
        def normalize_bssid(b: str) -> str:
            if not b:
                return ""
            return b.replace(':', '').replace('-', '').upper().strip()
        
        normalized_bssid = normalize_bssid(bssid) if bssid else ""
        registered_bssids = [normalize_bssid(ap.mac_address) for ap in registered_aps if ap.mac_address]
        
        # Debug logging
        logger.warning(f"[WIFI DEBUG] Phone BSSID: '{bssid}' → normalized: '{normalized_bssid}'")
        logger.warning(f"[WIFI DEBUG] Registered BSSIDs: {registered_bssids}")
        
        bssid_matched = normalized_bssid in registered_bssids
        
        if not bssid_matched:
            raise ForbiddenError(
                f"You are not connected to the authorized WiFi network. "
                f"Detected: {bssid or 'none'}. "
                f"Required: {', '.join([ap.mac_address for ap in registered_aps]) or 'any registered network'}."
            )

    # =========================================================================
    # PHASE 2: DUPLICATE CHECK WITH ROW LOCKING (pessimistic lock)
    # =========================================================================

    today_start = datetime.now(timezone.utc).replace(tzinfo=None).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Use row-level lock to prevent race conditions
    # This ensures only ONE request can create attendance for this student+timetable combo
    duplicate = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.timetable_id == actual_timetable_id,
            AttendanceRecord.student_id == current_user.id,
            AttendanceRecord.marked_at >= today_start,
        )
        .with_for_update()  # Pessimistic lock: wait for other transactions
        .first()
    )
    if duplicate:
        raise ConflictError("Attendance already marked for this session today")

    # =========================================================================
    # PHASE 3: CREATE ATTENDANCE RECORD (all validations passed)
    # =========================================================================

    try:
        record = AttendanceRecord(
            timetable_id=actual_timetable_id,
            student_id=current_user.id,
            enrollment_id=enrollment.id,
            teacher_id=timetable.teacher_id,
            division_id=timetable.division_id,
            batch_id=timetable.batch_id,
            location_id=timetable.location_id,
            marked_at=now,
            status=AttendanceStatus.PRESENT,
            device_info=device_info_str,
        )
        db.add(record)
        entry.used_count = (entry.used_count or 0) + 1
        db.commit()
        db.refresh(record)
        
    except IntegrityError as e:
        # Catch any database constraint violations (belt-and-suspenders)
        db.rollback()
        logger.error(f"[INTEGRITY ERROR] Duplicate attendance attempt: {e}", exc_info=True)
        raise ConflictError(
            "Attendance already marked for this session. "
            "This may happen if you submitted the form multiple times."
        )
    except Exception as e:
        # Any other database error
        db.rollback()
        logger.error(f"[CRITICAL ERROR] Failed to mark attendance: {e}", exc_info=True)
        raise ValidationError("Failed to mark attendance. Please try again.")

    # =========================================================================
    # PHASE 4: POST-CREATION NOTIFICATIONS & BROADCASTS
    # =========================================================================

    if timetable.teacher_id:
        try:
            create_notification(
                db,
                user_id=timetable.teacher_id,
                title="New attendance marked",
                message=f"{current_user.first_name} {current_user.last_name} marked attendance for {timetable.subject}.",
            )
        except Exception as e:
            logger.warning(f"Failed to create notification: {e}")

    await attendance_ws_manager.broadcast(
        actual_timetable_id,
        {
            "event": "attendance_marked",
            "record": _serialize_record(record),
            "student": {
                "id": current_user.id,
                "name": f"{current_user.first_name} {current_user.last_name}".strip(),
            },
        },
    )

    await log_action(
        db,
        action="ATTENDANCE_MARKED",
        entity_type="attendance_record",
        user_id=current_user.id,
        entity_id=str(record.id),
        details={"timetable_id": actual_timetable_id, "method": method},
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

    q = db.query(AttendanceRecord).options(
        joinedload(AttendanceRecord.timetable).joinedload(Timetable.subject)
    ).filter(AttendanceRecord.student_id == user_id)

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
            "items": [_serialize_record(r, include_timetable=True) for r in records],
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
# POST /mark-absent/{timetable_id}  —  mark all unenrolled students as absent
# ---------------------------------------------------------------------------

@router.post("/mark-absent/{timetable_id}")
async def mark_absent_students(
    timetable_id: int,
    session_date: Optional[date] = Query(None, description="Date for the session (YYYY-MM-DD). Defaults to today."),
    request: Request = None,
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Mark all enrolled students who haven't marked attendance as ABSENT.
    
    This should be called after a session ends to automatically mark absent students.
    """
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError("Timetable not found")

    if current_user.role == UserRole.TEACHER and timetable.teacher_id != current_user.id:
        raise ForbiddenError("You are not the teacher for this timetable")

    target_date = session_date or date.today()
    
    # Use UTC for database queries but display local date
    day_start_utc = datetime.combine(target_date, datetime.min.time())
    day_end_utc = datetime.combine(target_date, datetime.max.time())

    # Get enrolled students for this division
    enrollment_query = (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.division_id == timetable.division_id,
            StudentEnrollment.status == EnrollmentStatus.ACTIVE,
        )
    )
    
    # If timetable has a batch, filter by batch too
    if timetable.batch_id:
        enrollment_query = enrollment_query.filter(
            StudentEnrollment.batch_id == timetable.batch_id
        )
    
    enrolled_students = enrollment_query.all()

    # Get students who already marked attendance for this session
    existing_records = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.timetable_id == timetable_id,
        )
        .all()
    )
    
    # Filter to today's records in Python (handles timezone better)
    today_records = [
        r for r in existing_records 
        if r.marked_at and r.marked_at.date() == target_date
    ]
    marked_student_ids = set(r.student_id for r in today_records)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    marked_absent = 0
    skipped_already_marked = 0

    for enrollment in enrolled_students:
        if enrollment.student_id in marked_student_ids:
            skipped_already_marked += 1
            continue

        record = AttendanceRecord(
            timetable_id=timetable_id,
            student_id=enrollment.student_id,
            enrollment_id=enrollment.id,
            teacher_id=timetable.teacher_id,
            division_id=timetable.division_id,
            batch_id=timetable.batch_id,
            location_id=timetable.location_id,
            marked_at=now,
            status=AttendanceStatus.ABSENT,
            device_info="system:marked_absent",
        )
        db.add(record)
        marked_absent += 1

    db.commit()

    await log_action(
        db,
        action="ABSENT_STUDENTS_MARKED",
        entity_type="attendance_batch",
        user_id=current_user.id,
        entity_id=str(timetable_id),
        details={
            "timetable_id": timetable_id,
            "date": target_date.isoformat(),
            "marked_absent": marked_absent,
            "skipped_already_marked": skipped_already_marked,
        },
        request=request,
    )

    return success_response(
        {
            "timetable_id": timetable_id,
            "date": target_date.isoformat(),
            "marked_absent": marked_absent,
            "skipped_already_marked": skipped_already_marked,
            "total_enrolled": len(enrolled_students),
        },
        f"Marked {marked_absent} students as absent"
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
    record.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
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

@router.get("")
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


# ---------------------------------------------------------------------------
# GET /today  —  today's attendance for teacher/admin
# ---------------------------------------------------------------------------

@router.get("/today")
def get_today_attendance(
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Get all attendance records for today. Teachers see their own, admins see all."""
    today = date.today()
    day_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=None)
    day_end = datetime.combine(today, datetime.max.time()).replace(tzinfo=None)
    
    query = (
        db.query(AttendanceRecord)
        .options(
            joinedload(AttendanceRecord.student),
            joinedload(AttendanceRecord.timetable).joinedload(Timetable.subject)
        )
        .filter(
            AttendanceRecord.marked_at >= day_start,
            AttendanceRecord.marked_at <= day_end,
        )
    )
    
    # Teachers only see their own students' attendance
    if current_user.role == UserRole.TEACHER:
        query = query.filter(AttendanceRecord.teacher_id == current_user.id)
    
    records = query.order_by(AttendanceRecord.marked_at.desc()).all()
    
    present_students = [_serialize_record_with_student(r) for r in records if r.status == AttendanceStatus.PRESENT]
    absent_students = [_serialize_record_with_student(r) for r in records if r.status == AttendanceStatus.ABSENT]
    late_students = [_serialize_record_with_student(r) for r in records if r.status == AttendanceStatus.LATE]
    
    return success_response({
        "date": today.isoformat(),
        "total": len(records),
        "present_count": len(present_students),
        "absent_count": len(absent_students),
        "late_count": len(late_students),
        "items": present_students + late_students,
        "all_records": [_serialize_record_with_student(r) for r in records],
    })
