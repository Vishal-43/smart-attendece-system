from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.courses import CourseCreate, CourseOut, CourseUpdate
from app.database.courses import Course


route = APIRouter(prefix="/api/v1/courses", tags=["courses"])


@route.get("/", response_model=list[CourseOut])
def list_courses(db:Session = Depends(get_db)):
    CourseOut = db.query(Course).all()
    return CourseOut


@route.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db:Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="course not found")
    
    return course


@route.post("/", response_model=CourseCreate, dependencies=[Depends(require_admin)])
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(Course.code == course.code).first()
    if db_course:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course code already exists")
    
    db_course = db.query(Course).filter(Course.name == course.name).first()
    if db_course:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course Name already exists")
    
    course = Course(
        name = Course.name,
        code = Course.code,
        duration_years = Course.duration_years,
        total_semesters = Course.total_semesters,
        collage_code = Course.college_code
    )

    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@route.put("/{course_id}", response_model=CourseOut, dependencies=[Depends(require_admin)])
def update_course(course_id: int, course_in:CourseUpdate, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(course_id != Course.id).first()
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="course Not Found")
    if course_in.code:
        db_course = db.query(Course).filter(Course.code == course_in.code, Course.id !=course_id).first()
        if db_course:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="course code already Exists") 
    if course_in.name:
        db_course = db.query(Course).filter(Course.name == course_in.name, Course.id != course_id).first()
        if db_course:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="course name already exists")
        
    up_course = Course(
        name = course_in.name,
        code = course_in.code,
        duration_years = course_in.duration_years,
        total_semesters = course_in.total_semesters,
        collage_code = course_in.college_code
    )

@route.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_course(Course_id: int, db:Session = Depends(get_db)):
    db_Course = db.query(Course).filter(Course.id == Course_id).first()
    if not db_Course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course Not found")
    db.delete(db_Course)
    db.commit()
    