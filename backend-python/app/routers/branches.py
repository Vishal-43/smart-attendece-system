from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.branches import BranchCreate, BranchOut, BranchUpdate
from app.database.branches import Branch 

router = APIRouter(prefix="/api/v1/branches", tags=["branches"])

@router.get("/", response_model=list[BranchOut])
def list_all_branches(db: Session = Depends(get_db)):
    branches = db.query(Branch).all()
    return branches

@router.get("/course_id:{course_id}", response_model=list[BranchOut])
def list_branches_by_Course(Course_id: int,db: Session = Depends(get_db)):
    branches = db.query(Branch).filter(Branch.course_id == Course_id).all()
    if not branches:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"for {Course_id} No branches Found")
    return branches

@router.get("/branch_id:{branch_id}", response_model=BranchOut)
def get_branch_by_id(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="branch not found")
    return branch 

@router.post("/", response_model=BranchOut, dependencies=[Depends(require_admin)])
def create_branch(branch:BranchCreate, db:Session = Depends(get_db)):
    db_branch = db.query(Branch).filter(Branch.code == branch.code).first()
    if db_branch:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="branch code already exists")
    
    db_branch = db.query(Branch).filter(Branch.name == branch.name).first()
    if db_branch:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Branch name already Exists")
    
    branch = Branch(
        course_id = branch.course_id,
        name = branch.name,
        code = branch.code,
        branch_code = branch.branch_code
    )

    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch

@router.put("/{branch_id}", response_model=BranchOut, dependencies=[Depends(require_admin)])
def update_branch(branch_id: int, branch_in: BranchUpdate, db: Session = Depends(get_db)):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not db_branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    if branch_in.code:
        db_branch = db.query(Branch).filter(Branch.code == branch_in.code, Branch.id != branch_id).first()
        if db_branch:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Branch code already exists")
        if branch_in.name:
            db_branch = db.query(Branch).filter(Branch.name == branch_in.name, Branch.id != branch_id).first()
            if db_branch:
                db_branch = db.query(Branch).filter(Branch.name == branch_in.name, Branch.id != branch_id).first()
                if db_branch:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Branch name aready exists")
    up_branch = Branch(
                    course_id = branch_in.course_id,
                    name = branch_in.name,
                    code = branch_in.code,
                    branch_code = branch_in.branch_code
                )
    db_branch.update(up_branch.dict(exclude_unset=True))
    db.commit()
    return db_branch.first()

@router.delete("/{branch_id}", dependencies=[Depends(require_admin)])
def delete_branch(branch_id: int, db: Session = Depends(get_db)):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not db_branch: 
        raise HTTPException(status_code =status.HTTP_404_NOT_FOUND, detail="Branch not found")
    db.delete(db_branch)
    db.commit()

 