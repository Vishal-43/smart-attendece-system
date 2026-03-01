from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.branches import BranchCreate, BranchOut, BranchUpdate
from app.database.branches import Branch

router = APIRouter(prefix="/api/v1/branches", tags=["branches"])


@router.get("/", response_model=list[BranchOut])
def list_all_branches(db: Session = Depends(get_db)):
    return db.query(Branch).all()


@router.get("/course/{course_id}", response_model=list[BranchOut])
def list_branches_by_course(course_id: int, db: Session = Depends(get_db)):
    return db.query(Branch).filter(Branch.course_id == course_id).all()


@router.get("/{branch_id}", response_model=BranchOut)
def get_branch(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found"
        )
    return branch


@router.post("/", response_model=BranchOut, dependencies=[Depends(require_admin)])
def create_branch(branch_in: BranchCreate, db: Session = Depends(get_db)):
    if db.query(Branch).filter(Branch.code == branch_in.code).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch code already exists",
        )
    if db.query(Branch).filter(Branch.name == branch_in.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch name already exists",
        )
    new_branch = Branch(
        course_id=branch_in.course_id,
        name=branch_in.name,
        code=branch_in.code,
        branch_code=branch_in.branch_code,
    )
    db.add(new_branch)
    db.commit()
    db.refresh(new_branch)
    return new_branch


@router.put(
    "/{branch_id}", response_model=BranchOut, dependencies=[Depends(require_admin)]
)
def update_branch(
    branch_id: int, branch_in: BranchUpdate, db: Session = Depends(get_db)
):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not db_branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found"
        )
    if branch_in.code:
        conflict = (
            db.query(Branch)
            .filter(Branch.code == branch_in.code, Branch.id != branch_id)
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch code already exists",
            )
    if branch_in.name:
        conflict = (
            db.query(Branch)
            .filter(Branch.name == branch_in.name, Branch.id != branch_id)
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch name already exists",
            )

    update_data = branch_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_branch, key, value)
    db.commit()
    db.refresh(db_branch)
    return db_branch


@router.delete(
    "/{branch_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_branch(branch_id: int, db: Session = Depends(get_db)):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not db_branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found"
        )
    db.delete(db_branch)
    db.commit()
