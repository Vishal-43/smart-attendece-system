from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_admin
from app.core.response import success_response
from app.database.student_enrollments import EnrollmentStatus, StudentEnrollment
from app.schemas.timetable import TimeTableCreate, TimeTableOut, TimeTableUpdate
from app.database.timetables import DayOfWeek, Timetable
from app.database.user import User

router = APIRouter(prefix="/api/v1/timetables", tags=["timetables"])


def _serialize_timetables(items: list[Timetable]) -> list[dict]:
    return [TimeTableOut.model_validate(item).model_dump(mode="json") for item in items]


def _base_schedule_query(db: Session, current_user: User):
    query = db.query(Timetable).filter(Timetable.is_active.is_(True))
    if current_user.role.value == "teacher":
        query = query.filter(Timetable.teacher_id == current_user.id)
    elif current_user.role.value == "student":
        enrolled_divisions = (
            db.query(StudentEnrollment.division_id)
            .filter(
                StudentEnrollment.student_id == current_user.id,
                StudentEnrollment.status == EnrollmentStatus.ACTIVE,
            )
            .all()
        )
        division_ids = [row[0] for row in enrolled_divisions]
        if not division_ids:
            return query.filter(Timetable.id == -1)
        query = query.filter(Timetable.division_id.in_(division_ids))
    return query


@router.get("/today")
def get_today_timetable(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    day_map = {
        0: DayOfWeek.MON,
        1: DayOfWeek.TUE,
        2: DayOfWeek.WED,
        3: DayOfWeek.THU,
        4: DayOfWeek.FRI,
        5: DayOfWeek.SAT,
    }
    current_day = day_map.get(datetime.utcnow().weekday())
    if not current_day:
        return success_response([], "No timetable entries for today")

    items = (
        _base_schedule_query(db, current_user)
        .filter(Timetable.day_of_week == current_day)
        .order_by(Timetable.start_time.asc())
        .all()
    )
    return success_response(_serialize_timetables(items), "Today's timetable retrieved successfully")


@router.get("/my-schedule")
def get_my_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = (
        _base_schedule_query(db, current_user)
        .order_by(Timetable.day_of_week.asc(), Timetable.start_time.asc())
        .all()
    )
    return success_response(_serialize_timetables(items), "My schedule retrieved successfully")


@router.get("/")
def list_all_timetables(db: Session = Depends(get_db)):
    timetables = db.query(Timetable).all()
    return success_response(_serialize_timetables(timetables), "Timetables retrieved successfully")


@router.get("/{timetable_id}")
def get_timetable(timetable_id: int, db: Session = Depends(get_db)):
    timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found"
        )
    return success_response(_serialize_timetables([timetable])[0], "Timetable retrieved successfully")


@router.get("/division/{division_id}")
def list_timetables_by_division(division_id: int, db: Session = Depends(get_db)):
    timetables = db.query(Timetable).filter(Timetable.division_id == division_id).all()
    return success_response(_serialize_timetables(timetables), "Timetables retrieved successfully")


@router.get("/teacher/{teacher_id}")
def list_timetables_by_teacher(teacher_id: int, db: Session = Depends(get_db)):
    timetables = db.query(Timetable).filter(Timetable.teacher_id == teacher_id).all()
    return success_response(_serialize_timetables(timetables), "Timetables retrieved successfully")


@router.get("/location/{location_id}")
def list_timetables_by_location(location_id: int, db: Session = Depends(get_db)):
    timetables = db.query(Timetable).filter(Timetable.location_id == location_id).all()
    return success_response(_serialize_timetables(timetables), "Timetables retrieved successfully")


@router.post("/")
def create_timetable(timetable_in: TimeTableCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    conflict = (
        db.query(Timetable)
        .filter(
            Timetable.division_id == timetable_in.division_id,
            Timetable.teacher_id == timetable_in.teacher_id,
            Timetable.location_id == timetable_in.location_id,
            Timetable.day_of_week == timetable_in.day_of_week,
            Timetable.start_time == timetable_in.start_time,
            Timetable.end_time == timetable_in.end_time,
            Timetable.semester == timetable_in.semester,
            Timetable.academic_year == timetable_in.academic_year,
        )
        .first()
    )
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Same schedule already exists",
        )
    new_timetable = Timetable(**timetable_in.model_dump())
    db.add(new_timetable)
    db.commit()
    db.refresh(new_timetable)
    return success_response(_serialize_timetables([new_timetable])[0], "Timetable created successfully", 201)


@router.put("/{timetable_id}")
def update_timetable(
    timetable_id: int, timetable_in: TimeTableUpdate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    db_timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not db_timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found"
        )
    update_data = timetable_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_timetable, key, value)
    db.commit()
    db.refresh(db_timetable)
    return success_response(_serialize_timetables([db_timetable])[0], "Timetable updated successfully")


@router.delete("/{timetable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable(timetable_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    db_timetable = db.query(Timetable).filter(Timetable.id == timetable_id).first()
    if not db_timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found"
        )
    db.delete(db_timetable)
    db.commit()
