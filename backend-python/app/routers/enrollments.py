from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.enrollment import EnrollmentCreate, EnrollmentOut, EnrollmentUpdate
from app.database.student_enrollments import StudentEnrollment

router = APIRouter(prefix="/api/v1/enrollments", tags=["enrollments"])


@router.get("/", response_model=list[EnrollmentOut])
def list_enrollments(db: Session = Depends(get_db)):
    return db.query(StudentEnrollment).all()


@router.get("/{enrollment_id}", response_model=EnrollmentOut)
def get_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    enrollment = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.id == enrollment_id)
        .first()
    )
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found"
        )
    return enrollment


@router.get("/student/{student_id}", response_model=list[EnrollmentOut])
def list_enrollments_by_student(student_id: int, db: Session = Depends(get_db)):
    return (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.student_id == student_id)
        .all()
    )


@router.get("/course/{course_id}", response_model=list[EnrollmentOut])
def list_enrollments_by_course(course_id: int, db: Session = Depends(get_db)):
    return (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.course_id == course_id)
        .all()
    )


@router.get("/branch/{branch_id}", response_model=list[EnrollmentOut])
def list_enrollments_by_branch(branch_id: int, db: Session = Depends(get_db)):
    return (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.branch_id == branch_id)
        .all()
    )


@router.get("/division/{division_id}", response_model=list[EnrollmentOut])
def list_enrollments_by_division(division_id: int, db: Session = Depends(get_db)):
    return (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.division_id == division_id)
        .all()
    )


@router.post("/", response_model=EnrollmentOut, dependencies=[Depends(require_admin)])
def create_enrollment(
    enrollment_in: EnrollmentCreate, db: Session = Depends(get_db)
):
    if (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.enrollment_number == enrollment_in.enrollment_number
        )
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enrollment number already exists",
        )
    new_enrollment = StudentEnrollment(**enrollment_in.model_dump())
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment


@router.put(
    "/{enrollment_id}",
    response_model=EnrollmentOut,
    dependencies=[Depends(require_admin)],
)
def update_enrollment(
    enrollment_id: int,
    enrollment_in: EnrollmentUpdate,
    db: Session = Depends(get_db),
):
    db_enrollment = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.id == enrollment_id)
        .first()
    )
    if not db_enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found"
        )
    update_data = enrollment_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_enrollment, key, value)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment


@router.delete(
    "/{enrollment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    db_enrollment = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.id == enrollment_id)
        .first()
    )
    if not db_enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found"
        )
    db.delete(db_enrollment)
    db.commit()
