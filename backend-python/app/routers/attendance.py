from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
import math

from app.core.dependencies import get_db, require_admin, get_current_user
from app.schemas.attendance_records import (
    AttendanceRecordCreate,
    AttendanceRecordUpdate,
    AttendanceRecordOut,
)
from app.database.attendance_records import AttendanceRecord

router = APIRouter(prefix="/api/v1/attendance", tags=["Attendance Records"])


# --- Geofencing & Access Point Verification ---

def is_within_geofence(user_lat, user_lon, target_lat, target_lon, radius_m=100):
    """Haversine formula to check if user is within geofence radius."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(user_lat)
    phi2 = math.radians(target_lat)
    delta_phi = math.radians(target_lat - user_lat)
    delta_lambda = math.radians(target_lon - user_lon)
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance <= radius_m


@router.post("/verify/geofencing")
async def verify_geofencing(request: Request):
    data = await request.json()
    user_lat = data.get("latitude")
    user_lon = data.get("longitude")
    if user_lat is None or user_lon is None:
        return JSONResponse(
            status_code=400,
            content={"message": "Missing latitude or longitude"},
        )
    # TODO: Fetch target location from DB based on timetable/session
    target_lat, target_lon = 12.9716, 77.5946
    if is_within_geofence(user_lat, user_lon, target_lat, target_lon):
        return {"message": "Geofencing verification successful."}
    return JSONResponse(
        status_code=403,
        content={"message": "Outside allowed geofence."},
    )


@router.post("/verify/accesspoint")
async def verify_access_point(request: Request):
    data = await request.json()
    ssid = data.get("ssid")
    bssid = data.get("bssid")
    # TODO: Fetch allowed SSID/BSSID from DB
    allowed_ssid = "ExampleSSID"
    allowed_bssid = "00:11:22:33:44:55"
    if ssid == allowed_ssid and bssid == allowed_bssid:
        return {"message": "Access point verification successful."}
    return JSONResponse(
        status_code=403,
        content={"message": "Access point not allowed."},
    )


# --- CRUD Endpoints ---

@router.get("/", response_model=list[AttendanceRecordOut])
def list_attendance_records(db: Session = Depends(get_db)):
    return db.query(AttendanceRecord).all()


@router.get("/{record_id}", response_model=AttendanceRecordOut)
def get_attendance_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    return record


@router.get("/student/{student_id}", response_model=list[AttendanceRecordOut])
def get_attendance_records_by_student(student_id: int, db: Session = Depends(get_db)):
    records = (
        db.query(AttendanceRecord)
        .filter(AttendanceRecord.student_id == student_id)
        .all()
    )
    return records


@router.post(
    "/",
    response_model=AttendanceRecordOut,
    dependencies=[Depends(require_admin)],
)
def create_attendance_record(
    record: AttendanceRecordCreate, db: Session = Depends(get_db)
):
    existing = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.timetable_id == record.timetable_id,
            AttendanceRecord.student_id == record.student_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance record already exists for this student in this timetable",
        )
    new_record = AttendanceRecord(**record.model_dump())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.put(
    "/{record_id}",
    response_model=AttendanceRecordOut,
    dependencies=[Depends(require_admin)],
)
def update_attendance_record(
    record_id: int,
    record_in: AttendanceRecordUpdate,
    db: Session = Depends(get_db),
):
    db_record = (
        db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    )
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    update_data = record_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
    db.commit()
    db.refresh(db_record)
    return db_record


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_attendance_record(record_id: int, db: Session = Depends(get_db)):
    db_record = (
        db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    )
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    db.delete(db_record)
    db.commit()
