from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.timetable import TimeTableCreate, TimeTableOut, TimeTableUpdate
from app.database.timetables import Timetable


router = APIRouter(prefix="/api/v1/timetables", tags=["Timetables"])

@router.get("/" ,response_model=list[TimeTableOut])
def list_all_timetables(db: Session = Depends(get_db)):
    return db.query(Timetable).all()

@router.get("/{timetable_id}" ,response_model=TimeTableOut)
def list_timetables_by_id(timetable_id:int ,db: Session = Depends(get_db)):
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="timetable not found")
    return timetable



@router.get("/division_id:{division_id}" ,response_model=TimeTableOut)
def list_timetables_by_division_id(division_id:int ,db: Session = Depends(get_db)):
    timetable = db.query(Timetable).filter(Timetable.division_id == division_id).first()
    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="timetable not found")
    return timetable

@router.get("/teacher_id:{teacher_id}" ,response_model=TimeTableOut)
def list_timetables_by_teacher_id(teacher_id:int ,db: Session = Depends(get_db)):
    timetable = db.query(Timetable).filter(Timetable.teacher_id == teacher_id).first()
    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="timetable not found")
    return timetable

@router.get("/location_id:{location_id}" ,response_model=TimeTableOut)
def list_timetables_by_location_id(location_id:int ,db: Session = Depends(get_db)):
    timetable = db.query(Timetable).filter(Timetable.location_id == location_id).first()
    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="timetable not found")
    return timetable

@router.post("/", response_model=TimeTableOut, dependencies=[Depends(require_admin)])
def create_timetable(timetable_in: TimeTableCreate, db:Session = Depends(get_db)):
    db_timetable = db.query(Timetable).filter(
        Timetable.division_id == timetable_in.division_id,
        Timetable.teacher_id == timetable_in.teacher_id,
        Timetable.location_id == timetable_in.location_id,
        Timetable.day_of_week == timetable_in.day_of_week,
        Timetable.start_time == timetable_in.start_time,
        Timetable.end_time == timetable_in.end_time,
        Timetable.semester == timetable_in.semester,
        Timetable.academic_year == timetable_in.academic_year
    ).first()

    if db_timetable:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="same schedule already exists")
    new_timetable = Timetable(**timetable_in.dict())
    db.add(new_timetable)
    db.commit()
    db.refresh(new_timetable)
    return new_timetable


@router.put("/{timetable_id}", response_model=TimeTableOut, dependencies=[Depends(require_admin)])
def update_timetable(timetable_id: int, timetable_in: TimeTableOut, db:Session = Depends(get_db)):
    db_timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not db_timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="timetable not found")
    for var, value in vars(timetable_in).items():
        if value is not None:
            setattr(db_timetable,var, value)
    db.commit()
    db.refresh(db_timetable)
    return db_timetable

@router.delete("/{timetable_id}", response_model=None, dependencies=[Depends(require_admin)])
def delete_timetable(timetable_id: int, db: Session = Depends(get_db)):
    db_timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not db_timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="timetable not found")
    db.delete(db_timetable)
    db.commit()
   
