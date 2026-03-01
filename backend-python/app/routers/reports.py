# app/routers/reports.py
# Analytics and reporting endpoints for attendance data.

from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session
import csv
import io

from app.core.dependencies import get_db, get_current_user, require_admin, require_role
from app.core.exceptions import NotFoundError
from app.core.response import success_response
from app.database.attendance_records import AttendanceRecord
from app.database.student_enrollments import StudentEnrollment
from app.database.timetables import Timetable
from app.database.user import User
from app.database.divisions import Division
from app.database.courses import Course
from app.database.branches import Branch

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/attendance-summary")
def get_attendance_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    division_id: Optional[int] = Query(None),
    course_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get attendance summary statistics.
    
    Returns total present/absent/late counts per division/course for given date range.
    Admin/Teacher can view all, students only their own enrollment.
    """
    query = db.query(
        AttendanceRecord.status,
        func.count(AttendanceRecord.id).label('count')
    )
    
    # Apply date filters
    if start_date:
        query = query.filter(func.date(AttendanceRecord.marked_at) >= start_date)
    if end_date:
        query = query.filter(func.date(AttendanceRecord.marked_at) <= end_date)
    
    # If student, only show their own records
    if current_user.role == 'student':
        query = query.filter(AttendanceRecord.student_id == current_user.id)
    
    # Apply division filter (join through timetable and enrollment)
    if division_id:
        query = query.join(TimeTable, AttendanceRecord.timetable_id == TimeTable.id)
        query = query.filter(TimeTable.division_id == division_id)
    
    # Apply course filter
    if course_id:
        query = query.join(TimeTable, AttendanceRecord.timetable_id == TimeTable.id)
        query = query.join(Division, TimeTable.division_id == Division.id)
        query = query.join(Branch, Division.branch_id == Branch.id)
        query = query.filter(Branch.course_id == course_id)
    
    # Group by status
    query = query.group_by(AttendanceRecord.status)
    
    results = query.all()
    
    summary = {
        'present': 0,
        'absent': 0,
        'late': 0,
        'total': 0
    }
    
    for row in results:
        status = row.status.lower() if row.status else 'unknown'
        count = row.count
        
        if status == 'present':
            summary['present'] = count
        elif status == 'absent':
            summary['absent'] = count
        elif status == 'late':
            summary['late'] = count
        
        summary['total'] += count
    
    # Calculate percentage
    if summary['total'] > 0:
        summary['attendance_rate'] = round((summary['present'] / summary['total']) * 100, 2)
    else:
        summary['attendance_rate'] = 0.0
    
    # Add filter info
    summary['filters'] = {
        'start_date': start_date.isoformat() if start_date else None,
        'end_date': end_date.isoformat() if end_date else None,
        'division_id': division_id,
        'course_id': course_id
    }
    
    return success_response(summary, "Attendance summary retrieved successfully")


@router.get("/student/{user_id}")
def get_student_report(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get per-student attendance percentage per course.
    
    Students can only view their own report.
    Teachers/admins can view any student.
    """
    # Authorization: student can only view own, teachers/admins can view all
    if current_user.role == 'student' and current_user.id != user_id:
        from app.core.exceptions import ForbiddenError
        raise ForbiddenError()
    
    # Verify student exists
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise NotFoundError(message=f"Student with id {user_id} not found")
    
    # Get all enrollments for this student
    enrollments = db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == user_id
    ).all()
    
    if not enrollments:
        return success_response({
            'student_id': user_id,
            'student_name': f"{student.first_name} {student.last_name}",
            'courses': []
        }, "No enrollments found for student")
    
    courses_data = []
    
    for enrollment in enrollments:
        # Get division and course info
        division = db.query(Division).filter(Division.id == enrollment.division_id).first()
        if not division:
            continue
        
        branch = db.query(Branch).filter(Branch.id == division.branch_id).first()
        if not branch:
            continue
        
        course = db.query(Course).filter(Course.id == branch.course_id).first()
        if not course:
            continue
        
        # Get timetables for this division
        timetables = db.query(TimeTable).filter(TimeTable.division_id == division.id).all()
        timetable_ids = [t.id for t in timetables]
        
        if not timetable_ids:
            courses_data.append({
                'course_id': course.id,
                'course_name': course.name,
                'course_code': course.code,
                'division': division.name,
                'total_sessions': 0,
                'attended': 0,
                'attendance_rate': 0.0
            })
            continue
        
        # Count attendance records for this student in these timetables
        total_sessions = db.query(func.count(AttendanceRecord.id)).filter(
            and_(
                AttendanceRecord.student_id == user_id,
                AttendanceRecord.timetable_id.in_(timetable_ids)
            )
        ).scalar() or 0
        
        attended_sessions = db.query(func.count(AttendanceRecord.id)).filter(
            and_(
                AttendanceRecord.student_id == user_id,
                AttendanceRecord.timetable_id.in_(timetable_ids),
                or_(
                    AttendanceRecord.status == 'present',
                    AttendanceRecord.status == 'late'
                )
            )
        ).scalar() or 0
        
        attendance_rate = round((attended_sessions / total_sessions * 100), 2) if total_sessions > 0 else 0.0
        
        courses_data.append({
            'course_id': course.id,
            'course_name': course.name,
            'course_code': course.code,
            'division': division.name,
            'total_sessions': total_sessions,
            'attended': attended_sessions,
            'attendance_rate': attendance_rate
        })
    
    return success_response({
        'student_id': user_id,
        'student_name': f"{student.first_name} {student.last_name}",
        'student_email': student.email,
        'courses': courses_data
    }, "Student report retrieved successfully")


@router.get("/class/{timetable_id}")
def get_class_report(
    timetable_id: int,
    session_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('teacher', 'admin'))
):
    """
    Get per-session attendance list with student names and attendance percentage.
    
    Teachers can only view their own timetables.
    Admins can view all.
    """
    # Verify timetable exists
    timetable = db.query(TimeTable).filter(TimeTable.id == timetable_id).first()
    if not timetable:
        raise NotFoundError(message=f"Timetable with id {timetable_id} not found")
    
    # Authorization: teachers can only view their own timetables
    if current_user.role == 'teacher' and timetable.teacher_id != current_user.id:
        from app.core.exceptions import ForbiddenError
        raise ForbiddenError(message="You can only view attendance for your own classes")
    
    # Get attendance records for this timetable
    query = db.query(AttendanceRecord).filter(AttendanceRecord.timetable_id == timetable_id)
    
    if session_date:
        query = query.filter(func.date(AttendanceRecord.marked_at) == session_date)
    
    records = query.all()
    
    # Get enrolled students for this division
    division = db.query(Division).filter(Division.id == timetable.division_id).first()
    enrollments = db.query(StudentEnrollment).filter(
        StudentEnrollment.division_id == timetable.division_id
    ).all()
    
    enrolled_student_ids = {e.student_id for e in enrollments}
    
    # Build student attendance data
    students_data = []
    attended_count = 0
    
    for student_id in enrolled_student_ids:
        student = db.query(User).filter(User.id == student_id).first()
        if not student:
            continue
        
        # Find attendance record for this student
        student_record = next((r for r in records if r.student_id == student_id), None)
        
        status = student_record.status if student_record else 'absent'
        marked_at = student_record.marked_at.isoformat() if student_record else None
        
        if status in ['present', 'late']:
            attended_count += 1
        
        students_data.append({
            'student_id': student.id,
            'student_name': f"{student.first_name} {student.last_name}",
            'student_email': student.email,
            'status': status,
            'marked_at': marked_at
        })
    
    total_students = len(enrolled_student_ids)
    attendance_percentage = round((attended_count / total_students * 100), 2) if total_students > 0 else 0.0
    
    return success_response({
        'timetable_id': timetable_id,
        'timetable_name': f"{timetable.subject} - {division.name if division else 'N/A'}",
        'session_date': session_date.isoformat() if session_date else 'all',
        'total_students': total_students,
        'attended': attended_count,
        'attendance_percentage': attendance_percentage,
        'students': students_data
    }, "Class report retrieved successfully")


@router.get("/export/csv")
def export_attendance_csv(
    timetable_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('teacher', 'admin'))
):
    """
    Export attendance records as CSV.
    
    Teachers can only export their own timetables.
    Admins can export all.
    """
    query = db.query(AttendanceRecord)
    
    # Apply filters
    if timetable_id:
        timetable = db.query(TimeTable).filter(TimeTable.id == timetable_id).first()
        if not timetable:
            raise NotFoundError(message=f"Timetable with id {timetable_id} not found")
        
        # Authorization check for teachers
        if current_user.role == 'teacher' and timetable.teacher_id != current_user.id:
            from app.core.exceptions import ForbiddenError
            raise ForbiddenError(message="You can only export your own classes")
        
        query = query.filter(AttendanceRecord.timetable_id == timetable_id)
    elif current_user.role == 'teacher':
        # If no timetable specified and user is teacher, only show their classes
        teacher_timetables = db.query(TimeTable.id).filter(TimeTable.teacher_id == current_user.id).all()
        timetable_ids = [t[0] for t in teacher_timetables]
        query = query.filter(AttendanceRecord.timetable_id.in_(timetable_ids))
    
    if start_date:
        query = query.filter(func.date(AttendanceRecord.marked_at) >= start_date)
    if end_date:
        query = query.filter(func.date(AttendanceRecord.marked_at) <= end_date)
    
    records = query.all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Attendance ID',
        'Student ID',
        'Student Name',
        'Student Email',
        'Timetable ID',
        'Subject',
        'Status',
        'Method',
        'Marked At',
        'Latitude',
        'Longitude'
    ])
    
    # Write data rows
    for record in records:
        student = db.query(User).filter(User.id == record.student_id).first()
        timetable = db.query(TimeTable).filter(TimeTable.id == record.timetable_id).first()
        
        writer.writerow([
            record.id,
            record.student_id,
            f"{student.first_name} {student.last_name}" if student else 'Unknown',
            student.email if student else 'N/A',
            record.timetable_id,
            timetable.subject if timetable else 'N/A',
            record.status,
            record.method,
            record.marked_at.isoformat() if record.marked_at else '',
            record.latitude if record.latitude else '',
            record.longitude if record.longitude else ''
        ])
    
    # Prepare response
    output.seek(0)
    
    filename = f"attendance_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
