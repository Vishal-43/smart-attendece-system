from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
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
