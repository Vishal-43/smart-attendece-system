from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.divisions import DivisionCreate, DivisionUpdate, DivisionOut
from app.database.divisions import Division
from app.database.branches import Branch
from app.database.courses import Course

router = APIRouter(prefix="/api/v1/divisions", tags=["divisions"])

@router.get("/", response_model=list[DivisionOut])
def list_all_divisions(db: Session = Depends(get_db)):
    divisions = db.query(Division).all()
    return divisions
@router.get("/course:{course_id}", response_model=list[DivisionOut])
def list_divisions_by_course(course_id: int, db:Session = Depends(get_db)):
    Courses = db.query(Course).filter(course_id == Course.id).first()
    divisions = []
    for course_id in Courses:
        branches = db.query(Branch).filter(Branch.course_id == course_id).all()
        for branch in branches:
            division = db.query(Division).filter(Division.branch_id == branch.id).all()
            divisions.extend(division)
    return divisions

@router.get("/branch_id:{branch_id}", response_model=list[DivisionOut])
def lsit_divisions_by_branch(branch_id:int, db:Session = Depends(get_db)):
    
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    divisions = db.query(Division).filter(Division.branch_id == branch_id).all()
    return divisions  

@router.post("/", response_model=DivisionOut, dependencies=[Depends(require_admin)])
def create_division(division: DivisionCreate, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == division.branch_id).first()
    if not branch:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail="Branch not found")
    new_division = Division(
        branch_id = division.branch_id,
        name = division.name,
        year = division.year,
        semester = division.semester,
        academic_year = division.academic_year,
        capacity = division.capacity 
    )

    db.add(new_division)
    db.commit()
    db.refresh(new_division)
    return new_division

@router.put("/{division_id}", response_model=DivisionOut, dependencies=[Depends(require_admin)])
def update_division(division_id: int, division_in: DivisionUpdate, db: Session):
    division = db.query(Division).filter(Division.id == division_id).first()
    if not division:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Division not found")
    
    for var, value in vars(division_in).items():
        if value is not None:
            setattr(division,var,value)
    
    db.commit()
    db.refresh(division)
    return division

@router.delete("/{division_id}", dependencies=[Depends(require_admin)])
def delete_division(division_id: int, db:Session = Depends(get_db)):
    division = db.query(Division).filter(Division.id == division_id).first()
    if not division:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Divsion not found")
    db.delete(division)
    db.commit()
    
