from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.courses import CourseCreate, CourseOut, CourseUpdate
from app.database.courses import Course

router = APIRouter(prefix="/api/v1/courses", tags=["courses"])


@router.get("/", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    return course


@router.post("/", response_model=CourseOut, dependencies=[Depends(require_admin)])
def create_course(course_in: CourseCreate, db: Session = Depends(get_db)):
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
    return new_course


@router.put(
    "/{course_id}", response_model=CourseOut, dependencies=[Depends(require_admin)]
)
def update_course(
    course_id: int, course_in: CourseUpdate, db: Session = Depends(get_db)
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
    return db_course


@router.delete(
    "/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    db.delete(db_course)
    db.commit()
