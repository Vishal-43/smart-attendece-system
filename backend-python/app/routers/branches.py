from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.core.response import success_response
from app.schemas.branches import BranchCreate, BranchOut, BranchUpdate
from app.database.branches import Branch

router = APIRouter(prefix="/api/v1/branches", tags=["branches"])


def _serialize_branch(branch: Branch) -> dict:
    return {
        "id": branch.id,
        "course_id": branch.course_id,
        "name": branch.name,
        "code": branch.code,
        "branch_code": branch.branch_code,
        "created_at": branch.created_at.isoformat() if branch.created_at else None,
        "updated_at": branch.updated_at.isoformat() if branch.updated_at else None,
    }


@router.get("")
def list_all_branches(db: Session = Depends(get_db)):
    branches = db.query(Branch).all()
    return success_response([_serialize_branch(b) for b in branches], "Branches retrieved successfully")


@router.get("/course/{course_id}")
def list_branches_by_course(course_id: int, db: Session = Depends(get_db)):
    branches = db.query(Branch).filter(Branch.course_id == course_id).all()
    return success_response([_serialize_branch(b) for b in branches], "Branches retrieved successfully")


@router.get("/{branch_id}")
def get_branch(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found"
        )
    return success_response(_serialize_branch(branch), "Branch retrieved successfully")


@router.post("")
def create_branch(branch_in: BranchCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
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
    return success_response(_serialize_branch(new_branch), "Branch created successfully", 201)


@router.put("/{branch_id}")
def update_branch(
    branch_id: int, branch_in: BranchUpdate, db: Session = Depends(get_db), _=Depends(require_admin)
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
    return success_response(_serialize_branch(db_branch), "Branch updated successfully")


@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_branch(branch_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not db_branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found"
        )
    
    if db_branch.divisions:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete branch '{db_branch.name}' because it has {len(db_branch.divisions)} division(s). Remove the divisions first."
        )
    
    if db_branch.subjects:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete branch '{db_branch.name}' because it has {len(db_branch.subjects)} subject(s). Remove the subjects first."
        )
    
    db.delete(db_branch)
    db.commit()
