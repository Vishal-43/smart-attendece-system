from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.core.response import success_response
from app.schemas.enrollment import EnrollmentCreate, EnrollmentOut, EnrollmentUpdate
from app.database.student_enrollments import StudentEnrollment

router = APIRouter(prefix="/api/v1/enrollments", tags=["enrollments"])


def _serialize_enrollment(enrollment: StudentEnrollment) -> dict:
    return {
        "id": enrollment.id,
        "student_id": enrollment.student_id,
        "course_id": enrollment.course_id,
        "branch_id": enrollment.branch_id,
        "division_id": enrollment.division_id,
        "current_year": enrollment.current_year.value if enrollment.current_year else None,
        "current_semester": enrollment.current_semester,
        "enrollment_number": enrollment.enrollment_number,
        "enrollment_date": enrollment.enrollment_date.isoformat() if enrollment.enrollment_date else None,
        "academic_year": enrollment.academic_year,
        "status": enrollment.status.value if enrollment.status else None,
        "has_kt": enrollment.has_kt,
        "created_at": enrollment.created_at.isoformat() if enrollment.created_at else None,
        "updated_at": enrollment.updated_at.isoformat() if enrollment.updated_at else None,
    }


@router.get("/")
def list_enrollments(db: Session = Depends(get_db)):
    enrollments = db.query(StudentEnrollment).all()
    return success_response([_serialize_enrollment(e) for e in enrollments], "Enrollments retrieved successfully")


@router.get("/{enrollment_id}")
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
    return success_response(_serialize_enrollment(enrollment), "Enrollment retrieved successfully")


@router.get("/student/{student_id}")
def list_enrollments_by_student(student_id: int, db: Session = Depends(get_db)):
    enrollments = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.student_id == student_id)
        .all()
    )
    return success_response([_serialize_enrollment(e) for e in enrollments], "Enrollments retrieved successfully")


@router.get("/course/{course_id}")
def list_enrollments_by_course(course_id: int, db: Session = Depends(get_db)):
    enrollments = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.course_id == course_id)
        .all()
    )
    return success_response([_serialize_enrollment(e) for e in enrollments], "Enrollments retrieved successfully")


@router.get("/branch/{branch_id}")
def list_enrollments_by_branch(branch_id: int, db: Session = Depends(get_db)):
    enrollments = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.branch_id == branch_id)
        .all()
    )
    return success_response([_serialize_enrollment(e) for e in enrollments], "Enrollments retrieved successfully")


@router.get("/division/{division_id}")
def list_enrollments_by_division(division_id: int, db: Session = Depends(get_db)):
    enrollments = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.division_id == division_id)
        .all()
    )
    return success_response([_serialize_enrollment(e) for e in enrollments], "Enrollments retrieved successfully")


@router.post("/")
def create_enrollment(
    enrollment_in: EnrollmentCreate, db: Session = Depends(get_db), _=Depends(require_admin)
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
    return success_response(_serialize_enrollment(new_enrollment), "Enrollment created successfully", 201)


@router.put("/{enrollment_id}")
def update_enrollment(
    enrollment_id: int,
    enrollment_in: EnrollmentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
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
    return success_response(_serialize_enrollment(db_enrollment), "Enrollment updated successfully")


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
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
