from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.core.response import success_response
from app.schemas.courses import CourseCreate, CourseOut, CourseUpdate
from app.database.courses import Course

router = APIRouter(prefix="/api/v1/courses", tags=["courses"])


def _serialize_course(course: Course) -> dict:
    return {
        "id": course.id,
        "name": course.name,
        "code": course.code,
        "duration_years": course.duration_years,
        "total_semesters": course.total_semesters,
        "college_code": course.college_code,
        "created_at": course.created_at.isoformat() if course.created_at else None,
        "updated_at": course.updated_at.isoformat() if course.updated_at else None,
    }


@router.get("")
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return success_response([_serialize_course(c) for c in courses], "Courses retrieved successfully")


@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    return success_response(_serialize_course(course), "Course retrieved successfully")


@router.post("")
def create_course(course_in: CourseCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(Course).filter(Course.code == course_in.code).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course code already exists",
        )
    if db.query(Course).filter(Course.name == course_in.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course name already exists",
        )

    new_course = Course(
        name=course_in.name,
        code=course_in.code,
        duration_years=course_in.duration_years,
        total_semesters=course_in.total_semesters,
        college_code=course_in.college_code,
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return success_response(_serialize_course(new_course), "Course created successfully", 201)


@router.put("/{course_id}")
def update_course(
    course_id: int, course_in: CourseUpdate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    if course_in.code:
        conflict = (
            db.query(Course)
            .filter(Course.code == course_in.code, Course.id != course_id)
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course code already exists",
            )
    if course_in.name:
        conflict = (
            db.query(Course)
            .filter(Course.name == course_in.name, Course.id != course_id)
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course name already exists",
            )

    update_data = course_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_course, key, value)
    db.commit()
    db.refresh(db_course)
    return success_response(_serialize_course(db_course), "Course updated successfully")


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    
    if db_course.branches:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete course '{db_course.name}' because it has {len(db_course.branches)} branch(es). Remove the branches first."
        )
    
    if db_course.subjects:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete course '{db_course.name}' because it has {len(db_course.subjects)} subject(s). Remove the subjects first."
        )
    
    db.delete(db_course)
    db.commit()
