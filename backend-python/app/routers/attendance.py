from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
import math

router = APIRouter(prefix="/api/v1/attendance", tags=["Attendance Records"])
def is_within_geofence(user_lat, user_lon, target_lat, target_lon, radius_m=100):
    # Haversine formula
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(user_lat)
    phi2 = math.radians(target_lat)
    delta_phi = math.radians(target_lat - user_lat)
    delta_lambda = math.radians(target_lon - user_lon)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance <= radius_m

@router.post("/verify/geofencing")
async def verify_geofencing(request: Request):
    data = await request.json()
    user_lat = data.get("latitude")
    user_lon = data.get("longitude")
    # Example: Replace with real location from DB or config
    target_lat, target_lon = 12.9716, 77.5946
    if user_lat is None or user_lon is None:
        return JSONResponse(status_code=400, content={"message": "Missing latitude or longitude"})
    if is_within_geofence(user_lat, user_lon, target_lat, target_lon):
        return {"message": "Geofencing verification successful."}
    return JSONResponse(status_code=403, content={"message": "Outside allowed geofence."})

@router.post("/verify/accesspoint")
async def verify_access_point(request: Request):
    data = await request.json()
    ssid = data.get("ssid")
    bssid = data.get("bssid")
    # Example: Replace with real allowed SSID/BSSID from DB or config
    allowed_ssid = "ExampleSSID"
    allowed_bssid = "00:11:22:33:44:55"
    if ssid == allowed_ssid and bssid == allowed_bssid:
        return {"message": "Access point verification successful."}
    return JSONResponse(status_code=403, content={"message": "Access point not allowed."})
from app.core.dependencies import get_db, require_admin
from app.schemas.attendance_records import (
    AttendanceRecordCreate,
    AttendanceRecordUpdate,
    AttendanceRecordOut,
)
from app.database.attendance_records import AttendanceRecord

router = APIRouter(prefix="/api/v1/attendance", tags=["Attendance Records"])


@router.get("/", response_model=list[AttendanceRecordOut])
def list_attendance_records(db: Session = Depends(get_db)):
    records = db.query(AttendanceRecord).all()
    return records


@router.get("/{id}", response_model=list[AttendanceRecordOut])
def get_attendance_record(id: int, db: Session = Depends(get_db)):
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found"
        )
    return record


@router.get("/student_id:{id}", response_model=list[AttendanceRecordOut])
def get_attendance_records_by_student_id(id: int, db: Session = Depends(get_db)):
    record = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == id).all()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found"
        )
    return record


@router.post(
    "/", response_model=AttendanceRecordOut, dependencies=[Depends(require_admin)]
)
def create_attendance_record(
    record: AttendanceRecordCreate, db: Session = Depends(get_db)
):
    db_record = db.query(AttendanceRecord).filter(
        AttendanceRecord.timetable_id == record.timetable_id,
        AttendanceRecord.student_id == record.student_id,
        AttendanceRecord.enrollment_id == record.enrollment_id,
        AttendanceRecord.teacher_id == record.teacher_id,
        AttendanceRecord.division_id == record.division_id,
        AttendanceRecord.batch_id == record.batch_id,
    )
    if db_record.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance record already exists for this student in this timetable",
        )
    new_record = AttendanceRecord(**record.dict())
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
    record_id: int, record_in: AttendanceRecordUpdate, db: Session = Depends(get_db)
):
    db_record = (
        db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    )
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="attendance record not found"
        )
    for var, value in vars(record_in).items():
        if value is not None:
            setattr(db_record, var, value)
    db.commit()
    db.refresh(db_record)
    return db_record


@router.delete(
    "/{record_id}",
    response_model=AttendanceRecordOut,
    dependencies=[Depends(require_admin)],
)
def delete_attendance_record(record_id: int, db: Session = Depends(get_db)):
    db_record = (
        db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    )
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found"
        )
    db.delete(db_record)
    db.commit()
