from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.core.response import success_response
from app.schemas.divisions import DivisionCreate, DivisionUpdate, DivisionOut
from app.database.divisions import Division
from app.database.branches import Branch

router = APIRouter(prefix="/api/v1/divisions", tags=["divisions"])


def _serialize_division(division: Division) -> dict:
    return {
        "id": division.id,
        "branch_id": division.branch_id,
        "name": division.name,
        "year": division.year,
        "semester": division.semester,
        "academic_year": division.academic_year,
        "capacity": division.capacity,
        "branch_name": division.branch.name if division.branch else None,
        "course_name": division.branch.course.name if division.branch and division.branch.course else None,
        "created_at": division.created_at.isoformat() if division.created_at else None,
        "updated_at": division.updated_at.isoformat() if division.updated_at else None,
    }


@router.get("")
def list_all_divisions(db: Session = Depends(get_db)):
    divisions = db.query(Division).all()
    return success_response([_serialize_division(d) for d in divisions], "Divisions retrieved successfully")


@router.get("/branch/{branch_id}")
def list_divisions_by_branch(branch_id: int, db: Session = Depends(get_db)):
    divisions = db.query(Division).filter(Division.branch_id == branch_id).all()
    return success_response([_serialize_division(d) for d in divisions], "Divisions retrieved successfully")


@router.get("/{division_id}")
def get_division(division_id: int, db: Session = Depends(get_db)):
    division = db.query(Division).filter(Division.id == division_id).first()
    if not division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Division not found"
        )
    return success_response(_serialize_division(division), "Division retrieved successfully")


@router.post("")
def create_division(division_in: DivisionCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    branch = db.query(Branch).filter(Branch.id == division_in.branch_id).first()
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found"
        )
    
    existing = db.query(Division).filter(
        Division.branch_id == division_in.branch_id,
        Division.name == division_in.name,
        Division.academic_year == division_in.academic_year,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Division with this name already exists for this branch in the same academic year"
        )
    
    new_division = Division(
        branch_id=division_in.branch_id,
        name=division_in.name,
        year=division_in.year,
        semester=division_in.semester,
        academic_year=division_in.academic_year,
        capacity=division_in.capacity,
    )
    db.add(new_division)
    db.commit()
    db.refresh(new_division)
    return success_response(_serialize_division(new_division), "Division created successfully", 201)


@router.put("/{division_id}")
def update_division(
    division_id: int, division_in: DivisionUpdate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    db_division = db.query(Division).filter(Division.id == division_id).first()
    if not db_division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Division not found"
        )
    update_data = division_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_division, key, value)
    db.commit()
    db.refresh(db_division)
    return success_response(_serialize_division(db_division), "Division updated successfully")


@router.delete("/{division_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_division(division_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    from app.database.student_enrollments import StudentEnrollment
    from app.database.timetables import Timetable
    
    db_division = db.query(Division).filter(Division.id == division_id).first()
    if not db_division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Division not found"
        )
    
    enrollment_count = db.query(StudentEnrollment).filter(StudentEnrollment.division_id == division_id).count()
    if enrollment_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete division '{db_division.name}' because it has {enrollment_count} student enrollment(s). Remove the enrollments first."
        )
    
    timetable_count = db.query(Timetable).filter(Timetable.division_id == division_id).count()
    if timetable_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete division '{db_division.name}' because it has {timetable_count} timetable entry/entries. Remove the timetable entries first."
        )
    
    db.delete(db_division)
    db.commit()
