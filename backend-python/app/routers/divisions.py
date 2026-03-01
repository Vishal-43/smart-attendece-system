from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.divisions import DivisionCreate, DivisionUpdate, DivisionOut
from app.database.divisions import Division
from app.database.branches import Branch

router = APIRouter(prefix="/api/v1/divisions", tags=["divisions"])


@router.get("/", response_model=list[DivisionOut])
def list_all_divisions(db: Session = Depends(get_db)):
    return db.query(Division).all()


@router.get("/branch/{branch_id}", response_model=list[DivisionOut])
def list_divisions_by_branch(branch_id: int, db: Session = Depends(get_db)):
    return db.query(Division).filter(Division.branch_id == branch_id).all()


@router.get("/{division_id}", response_model=DivisionOut)
def get_division(division_id: int, db: Session = Depends(get_db)):
    division = db.query(Division).filter(Division.id == division_id).first()
    if not division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Division not found"
        )
    return division


@router.post("/", response_model=DivisionOut, dependencies=[Depends(require_admin)])
def create_division(division_in: DivisionCreate, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == division_in.branch_id).first()
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found"
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
    return new_division


@router.put(
    "/{division_id}", response_model=DivisionOut, dependencies=[Depends(require_admin)]
)
def update_division(
    division_id: int, division_in: DivisionUpdate, db: Session = Depends(get_db)
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
    return db_division


@router.delete(
    "/{division_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_division(division_id: int, db: Session = Depends(get_db)):
    db_division = db.query(Division).filter(Division.id == division_id).first()
    if not db_division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Division not found"
        )
    db.delete(db_division)
    db.commit()
