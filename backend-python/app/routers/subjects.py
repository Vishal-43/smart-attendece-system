from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.dependencies import get_db, require_admin, require_teacher_or_admin
from app.core.response import success_response
from app.schemas.subjects import SubjectCreate, SubjectUpdate, SubjectOut
from app.database.subjects import Subject
from app.database.courses import Course
from app.database.branches import Branch

router = APIRouter(prefix="/api/v1/subjects", tags=["subjects"])


def _serialize_subject(subject: Subject) -> dict:
    return {
        "id": subject.id,
        "name": subject.name,
        "code": subject.code,
        "description": subject.description,
        "course_id": subject.course_id,
        "branch_id": subject.branch_id,
        "semester": subject.semester,
        "is_active": subject.is_active,
        "course_name": subject.course.name if subject.course else None,
        "branch_name": subject.branch.name if subject.branch else None,
        "created_at": subject.created_at.isoformat() if subject.created_at else None,
        "updated_at": subject.updated_at.isoformat() if subject.updated_at else None,
    }


@router.get("")
def list_subjects(
    course_id: Optional[int] = None,
    branch_id: Optional[int] = None,
    semester: Optional[int] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: bool = Depends(require_teacher_or_admin),
):
    query = db.query(Subject)
    
    if course_id is not None:
        query = query.filter(Subject.course_id == course_id)
    if branch_id is not None:
        query = query.filter(Subject.branch_id == branch_id)
    if semester is not None:
        query = query.filter(Subject.semester == semester)
    if is_active is not None:
        query = query.filter(Subject.is_active == is_active)
    if search:
        query = query.filter(
            (Subject.name.ilike(f"%{search}%")) |
            (Subject.code.ilike(f"%{search}%"))
        )
    
    subjects = query.order_by(Subject.name).all()
    return success_response([_serialize_subject(s) for s in subjects], "Subjects retrieved successfully")


@router.get("/{subject_id}")
def get_subject(subject_id: int, db: Session = Depends(get_db), _: bool = Depends(require_teacher_or_admin)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return success_response(_serialize_subject(subject), "Subject retrieved successfully")


@router.post("", status_code=status.HTTP_201_CREATED)
def create_subject(subject_in: SubjectCreate, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    if db.query(Subject).filter(Subject.code == subject_in.code).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject with this code already exists")
    
    if not db.query(Course).filter(Course.id == subject_in.course_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course not found")
    
    if not db.query(Branch).filter(Branch.id == subject_in.branch_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Branch not found")
    
    subject = Subject(**subject_in.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return success_response(_serialize_subject(subject), "Subject created successfully", 201)


@router.put("/{subject_id}")
def update_subject(subject_id: int, subject_in: SubjectUpdate, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    
    update_data = subject_in.model_dump(exclude_unset=True)
    
    if "code" in update_data:
        existing = db.query(Subject).filter(Subject.code == update_data["code"], Subject.id != subject_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject with this code already exists")
    
    for key, value in update_data.items():
        setattr(subject, key, value)
    
    db.commit()
    db.refresh(subject)
    return success_response(_serialize_subject(subject), "Subject updated successfully")


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    
    if subject.timetables:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete subject '{subject.name}' because it is used in {len(subject.timetables)} timetable(s). Remove the timetable entries first."
        )
    
    db.delete(subject)
    db.commit()
