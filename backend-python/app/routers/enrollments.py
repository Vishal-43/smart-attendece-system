from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, require_admin
from app.schemas.enrollment import EnrollmentCreate, EnrollmentOut, EnrollmentUpdate
from app.database.student_enrollments import StudentEnrollment

router = APIRouter(prefix="/api/v1/enrollments", tags=["Enrollments"])

@router.get("/",response_model=list(EnrollmentOut))
def list_enrollments(db:Session = Depends(get_db)):
    enrollements = db.query(StudentEnrollment).all()
    return enrollements

@router.get("/id:{id}",response_model=list(EnrollmentOut))
def list_enrollments(id: int, db:Session = Depends(get_db)):
    enrollements = db.query(StudentEnrollment).filter(StudentEnrollment.id == id).all()
    return enrollements

@router.get("/student_id:{id}",response_model=list(EnrollmentOut))
def list_enrollments(id: int, db:Session = Depends(get_db)):
    enrollements = db.query(StudentEnrollment).filter(StudentEnrollment.student_id == id).all()
    return enrollements

@router.get("/course_id:{id}",response_model=list(EnrollmentOut))
def list_enrollments(id: int, db:Session = Depends(get_db)):
    enrollements = db.query(StudentEnrollment).filter(StudentEnrollment.course_id == id).all()
    return enrollements

@router.get("/branch_id:{id}",response_model=list(EnrollmentOut))
def list_enrollments(id: int, db:Session = Depends(get_db)):
    enrollements = db.query(StudentEnrollment).filter(StudentEnrollment.branch_id == id).all()
    return enrollements

@router.get("/division_id:{id}",response_model=list(EnrollmentOut))
def list_enrollments(id: int, db:Session = Depends(get_db)):
    enrollements = db.query(StudentEnrollment).filter(StudentEnrollment.division_id == id).all()
    return enrollements

@router.post("/",response_model=EnrollmentOut, dependencies=[Depends(require_admin)])
def create_enrollment(enrollment:EnrollmentCreate, db:Session = Depends(get_db)):
    db_enrollment = db.query(StudentEnrollment).filter(StudentEnrollment.enrollment_number == enrollment.enrollment_number).first()
    if db_enrollment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail= "Enrollment number already exists")
    new_enrollment = StudentEnrollment(**enrollment.dict())
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment

@router.put("/{enrollment_id}", response_model=EnrollmentOut, dependencies=[Depends(require_admin)])
def update_enrollment(enrollment_id: int, enrollment_in: EnrollmentUpdate, db:Session = Depends(get_db)):
    db_enrollment = db.query(StudentEnrollment).filter(StudentEnrollment.id == enrollment_id).first()
    if not db_enrollment.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    
    for var, value in vars(db_enrollment).items():
        if value is not None:
            setattr(db_enrollment,var, value)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment 

@router.delete("/{enrollment_id}", dependencies=[Depends(require_admin)])
def delete_enrollment(enrollment_id: int, db:Session = Depends(get_db)):
    db_enrollment = db.query(StudentEnrollment).filter(StudentEnrollment.id == enrollment_id).first()
    if not db_enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    db.delete(db_enrollment)
    db.commit()



        

