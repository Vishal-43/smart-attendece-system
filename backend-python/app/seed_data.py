"""
Seed script to test database connection and insert sample data
Run: python app/seed_data.py
"""

from datetime import datetime, date, time, timedelta
from app.database.database import engine, SessionLocal, Base
from app.database.user import User, UserRole
from app.database.courses import Course
from app.database.branches import Branch
from app.database.divisions import Division
from app.database.batches import Batch
from app.database.student_enrollments import StudentEnrollment, EnrollmentStatus, EnrollmentYear
from app.database.locations import Location, RoomType
from app.database.timetables import Timetable, LectureType, DayOfWeek
from app.database.qr_codes import QRCode
from app.database.otp_code import OTPCode
from app.database.attendance_records import AttendanceRecord, AttendanceStatus

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



def seed_users(session):
    """Insert sample users"""
    try:
        logger.info("👤 Inserting sample users...")
        
        # Admin user
        admin = User(
            email="admin@smartattendance.com",
            username="admin",
            password_hash="$2b$12$hashed_password_admin",  # In real app, use proper hashing
            first_name="Admin",
            last_name="User",
            phone="9999999999",
            role=UserRole.ADMIN,
            is_active=True
        )
        
        # Teacher users
        teacher1 = User(
            email="teacher1@smartattendance.com",
            username="teacher1",
            password_hash="$2b$12$hashed_password_teacher1",
            first_name="Rajesh",
            last_name="Kumar",
            phone="9876543210",
            role=UserRole.TEACHER,
            is_active=True
        )
        
        teacher2 = User(
            email="teacher2@smartattendance.com",
            username="teacher2",
            password_hash="$2b$12$hashed_password_teacher2",
            first_name="Priya",
            last_name="Sharma",
            phone="9876543211",
            role=UserRole.TEACHER,
            is_active=True
        )
        
        # Student users
        student1 = User(
            email="student1@smartattendance.com",
            username="student1",
            password_hash="$2b$12$hashed_password_student1",
            first_name="Aditya",
            last_name="Singh",
            phone="9876543220",
            role=UserRole.STUDENT,
            is_active=True
        )
        
        student2 = User(
            email="student2@smartattendance.com",
            username="student2",
            password_hash="$2b$12$hashed_password_student2",
            first_name="Neha",
            last_name="Verma",
            phone="9876543221",
            role=UserRole.STUDENT,
            is_active=True
        )
        
        student3 = User(
            email="student3@smartattendance.com",
            username="student3",
            password_hash="$2b$12$hashed_password_student3",
            first_name="Rohan",
            last_name="Patel",
            phone="9876543222",
            role=UserRole.STUDENT,
            is_active=True
        )
        
        session.add_all([admin, teacher1, teacher2, student1, student2, student3])
        session.commit()
        logger.info(f"✅ Inserted 6 users (1 admin, 2 teachers, 3 students)")
        
        return {
            'admin': admin.id,
            'teacher1': teacher1.id,
            'teacher2': teacher2.id,
            'student1': student1.id,
            'student2': student2.id,
            'student3': student3.id
        }
    except Exception as e:
        logger.error(f"❌ Error inserting users: {str(e)}")
        session.rollback()
        return None


def seed_courses(session):
    """Insert sample courses"""
    try:
        logger.info("📚 Inserting sample courses...")
        
        course1 = Course(
            name="Bachelor of Engineering",
            code="BE",
            duration_years=4,
            total_semesters=8,
            college_code="VU"
        )
        
        course2 = Course(
            name="Master of Engineering",
            code="ME",
            duration_years=2,
            total_semesters=4,
            college_code="VU"
        )
        
        session.add_all([course1, course2])
        session.commit()
        logger.info(f"✅ Inserted 2 courses")
        
        return {
            'be': course1.id,
            'me': course2.id
        }
    except Exception as e:
        logger.error(f"❌ Error inserting courses: {str(e)}")
        session.rollback()
        return None


def seed_branches(session, course_ids):
    """Insert sample branches"""
    try:
        logger.info("🏢 Inserting sample branches...")
        
        branch1 = Branch(
            course_id=course_ids['be'],
            name="Computer Engineering",
            code="COMP",
            branch_code="1"
        )
        
        branch2 = Branch(
            course_id=course_ids['be'],
            name="Information Technology",
            code="IT",
            branch_code="4"
        )
        
        branch3 = Branch(
            course_id=course_ids['be'],
            name="Mechanical Engineering",
            code="MECH",
            branch_code="2"
        )
        
        session.add_all([branch1, branch2, branch3])
        session.commit()
        logger.info(f"✅ Inserted 3 branches")
        
        return {
            'comp': branch1.id,
            'it': branch2.id,
            'mech': branch3.id
        }
    except Exception as e:
        logger.error(f"❌ Error inserting branches: {str(e)}")
        session.rollback()
        return None


def seed_divisions(session, branch_ids):
    """Insert sample divisions"""
    try:
        logger.info("📝 Inserting sample divisions...")
        
        # Create divisions for IT branch, Year 2, Semester 4
        div1 = Division(
            branch_id=branch_ids['it'],
            name="A",
            year=2,
            semester=4,
            academic_year="2024-2025",
            capacity=60
        )
        
        div2 = Division(
            branch_id=branch_ids['it'],
            name="B",
            year=2,
            semester=4,
            academic_year="2024-2025",
            capacity=55
        )
        
        session.add_all([div1, div2])
        session.commit()
        logger.info(f"✅ Inserted 2 divisions")
        
        return {
            'div_a': div1.id,
            'div_b': div2.id
        }
    except Exception as e:
        logger.error(f"❌ Error inserting divisions: {str(e)}")
        session.rollback()
        return None


def seed_batches(session, div_ids):
    """Insert sample batches"""
    try:
        logger.info("🔢 Inserting sample batches...")
        
        batches = []
        for div_key in ['div_a', 'div_b']:
            for batch_num in range(1, 4):
                batch = Batch(
                    division_id=div_ids[div_key],
                    name=f"Batch {batch_num}",
                    batch_number=batch_num,
                    semester=4,
                    academic_year="2024-2025"
                )
                batches.append(batch)
        
        session.add_all(batches)
        session.commit()
        logger.info(f"✅ Inserted {len(batches)} batches")
        
        return batches
    except Exception as e:
        logger.error(f"❌ Error inserting batches: {str(e)}")
        session.rollback()
        return None


def seed_student_enrollments(session, student_ids, course_ids, branch_ids, div_ids):
    """Insert sample student enrollments"""
    try:
        logger.info("✏️ Inserting sample student enrollments...")
        
        enrollment1 = StudentEnrollment(
            student_id=student_ids['student1'],
            course_id=course_ids['be'],
            branch_id=branch_ids['it'],
            division_id=div_ids['div_a'],
            current_year=EnrollmentYear.II,
            current_semester=4,
            enrollment_number="VU4f2425001",
            enrollment_date=date(2024, 1, 15),
            academic_year="2024-2025",
            status=EnrollmentStatus.ACTIVE,
            has_kt=False
        )
        
        enrollment2 = StudentEnrollment(
            student_id=student_ids['student2'],
            course_id=course_ids['be'],
            branch_id=branch_ids['it'],
            division_id=div_ids['div_a'],
            current_year=EnrollmentYear.II,
            current_semester=4,
            enrollment_number="VU4f2425002",
            enrollment_date=date(2024, 1, 15),
            academic_year="2024-2025",
            status=EnrollmentStatus.ACTIVE,
            has_kt=False
        )
        
        enrollment3 = StudentEnrollment(
            student_id=student_ids['student3'],
            course_id=course_ids['be'],
            branch_id=branch_ids['it'],
            division_id=div_ids['div_b'],
            current_year=EnrollmentYear.II,
            current_semester=4,
            enrollment_number="VU4f2425003",
            enrollment_date=date(2024, 1, 15),
            academic_year="2024-2025",
            status=EnrollmentStatus.ACTIVE,
            has_kt=False
        )
        
        session.add_all([enrollment1, enrollment2, enrollment3])
        session.commit()
        logger.info(f"✅ Inserted 3 student enrollments")
        
        return {
            'enr1': enrollment1.id,
            'enr2': enrollment2.id,
            'enr3': enrollment3.id
        }
    except Exception as e:
        logger.error(f"❌ Error inserting enrollments: {str(e)}")
        session.rollback()
        return None


def seed_locations(session):
    """Insert sample locations"""
    try:
        logger.info("📍 Inserting sample locations...")
        
        loc1 = Location(
            name="Room 301",
            latitude=19.1234,
            longitude=72.8765,
            radius=50,
            room_no="301",
            floor=3,
            room_type=RoomType.CLASSROOM,
            capacity=60
        )
        
        loc2 = Location(
            name="Computer Lab A",
            latitude=19.1235,
            longitude=72.8766,
            radius=40,
            room_no="Lab-A",
            floor=2,
            room_type=RoomType.LAB,
            capacity=40
        )
        
        session.add_all([loc1, loc2])
        session.commit()
        logger.info(f"✅ Inserted 2 locations")
        
        return {
            'room_301': loc1.id,
            'lab_a': loc2.id
        }
    except Exception as e:
        logger.error(f"❌ Error inserting locations: {str(e)}")
        session.rollback()
        return None


def seed_timetables(session, div_ids, teacher_ids, loc_ids):
    """Insert sample timetables"""
    try:
        logger.info("⏰ Inserting sample timetables...")
        
        # Theory lecture
        tt1 = Timetable(
            division_id=div_ids['div_a'],
            teacher_id=teacher_ids['teacher1'],
            location_id=loc_ids['room_301'],
            subject="Database Management System",
            lecture_type=LectureType.THEORY,
            batch_id=None,
            day_of_week=DayOfWeek.MON,
            start_time=time(9, 0),
            end_time=time(10, 30),
            semester=4,
            academic_year="2024-2025",
            is_active=True
        )
        
        # Practical session
        tt2 = Timetable(
            division_id=div_ids['div_a'],
            teacher_id=teacher_ids['teacher2'],
            location_id=loc_ids['lab_a'],
            subject="DBMS Lab",
            lecture_type=LectureType.PRACTICAL,
            batch_id=None,  # Will be set per batch when retrieving
            day_of_week=DayOfWeek.TUE,
            start_time=time(10, 30),
            end_time=time(12, 0),
            semester=4,
            academic_year="2024-2025",
            is_active=True
        )
        
        session.add_all([tt1, tt2])
        session.commit()
        logger.info(f"✅ Inserted 2 timetables")
        
        return {
            'tt1': tt1.id,
            'tt2': tt2.id
        }
    except Exception as e:
        logger.error(f"❌ Error inserting timetables: {str(e)}")
        session.rollback()
        return None


def seed_qr_codes(session, tt_ids):
    """Insert sample QR codes"""
    try:
        logger.info("🔲 Inserting sample QR codes...")
        
        now = datetime.utcnow()
        expires = now + timedelta(seconds=30)
        
        qr1 = QRCode(
            timetable_id=tt_ids['tt1'],
            code="QR_ENCODED_DATA_12345",
            expires_at=expires,
            used_count=0
        )
        
        session.add(qr1)
        session.commit()
        logger.info(f"✅ Inserted 1 QR code")
        
    except Exception as e:
        logger.error(f"❌ Error inserting QR codes: {str(e)}")
        session.rollback()


def seed_otp_codes(session, tt_ids):
    """Insert sample OTP codes"""
    try:
        logger.info("🔐 Inserting sample OTP codes...")
        
        now = datetime.utcnow()
        expires = now + timedelta(seconds=60)
        
        otp1 = OTPCode(
            timetable_id=tt_ids['tt1'],
            code="123456",
            expires_at=expires,
            used_count=0
        )
        
        session.add(otp1)
        session.commit()
        logger.info(f"✅ Inserted 1 OTP code")
        
    except Exception as e:
        logger.error(f"❌ Error inserting OTP codes: {str(e)}")
        session.rollback()


def seed_attendance(session, tt_ids, student_ids, enrollment_ids, div_ids, loc_ids):
    """Insert sample attendance records"""
    try:
        logger.info("✔️ Inserting sample attendance records...")
        
        att1 = AttendanceRecord(
            timetable_id=tt_ids['tt1'],
            student_id=student_ids['student1'],
            enrollment_id=enrollment_ids['enr1'],
            teacher_id=1,  # teacher1 ID
            division_id=div_ids['div_a'],
            batch_id=None,
            location_id=loc_ids['room_301'],
            status=AttendanceStatus.PRESENT,
            device_info='{"device": "iPhone 12", "os": "iOS 15"}',
            marked_at=datetime.utcnow()
        )
        
        att2 = AttendanceRecord(
            timetable_id=tt_ids['tt1'],
            student_id=student_ids['student2'],
            enrollment_id=enrollment_ids['enr2'],
            teacher_id=1,
            division_id=div_ids['div_a'],
            batch_id=None,
            location_id=loc_ids['room_301'],
            status=AttendanceStatus.LATE,
            device_info='{"device": "Samsung A12", "os": "Android 11"}',
            marked_at=datetime.utcnow()
        )
        
        session.add_all([att1, att2])
        session.commit()
        logger.info(f"✅ Inserted 2 attendance records")
        
    except Exception as e:
        logger.error(f"❌ Error inserting attendance: {str(e)}")
        session.rollback()


def main():
    """Main seed function"""
    logger.info("\n" + "="*60)
    logger.info("🌱 Starting Database Seeding...")
    logger.info("="*60 + "\n")
    
    
    session = SessionLocal()
    
    try:
        # Step 2: Insert data in order
        user_ids = seed_users(session)
        if not user_ids:
            return
        
        course_ids = seed_courses(session)
        if not course_ids:
            return
        
        branch_ids = seed_branches(session, course_ids)
        if not branch_ids:
            return
        
        div_ids = seed_divisions(session, branch_ids)
        if not div_ids:
            return
        
        seed_batches(session, div_ids)
        
        enrollment_ids = seed_student_enrollments(session, user_ids, course_ids, branch_ids, div_ids)
        if not enrollment_ids:
            return
        
        loc_ids = seed_locations(session)
        if not loc_ids:
            return
        
        tt_ids = seed_timetables(session, div_ids, user_ids, loc_ids)
        if not tt_ids:
            return
        
        seed_qr_codes(session, tt_ids)
        seed_otp_codes(session, tt_ids)
        seed_attendance(session, tt_ids, user_ids, enrollment_ids, div_ids, loc_ids)
        
        # Verify data
        logger.info("\n" + "="*60)
        logger.info("✅ Database Seeding Completed Successfully!")
        logger.info("="*60 + "\n")
        
        # Show sample data
        logger.info("📊 Sample Data Verification:")
        users_count = session.query(User).count()
        courses_count = session.query(Course).count()
        branches_count = session.query(Branch).count()
        divisions_count = session.query(Division).count()
        enrollments_count = session.query(StudentEnrollment).count()
        attendance_count = session.query(AttendanceRecord).count()
        
        logger.info(f"  - Users: {users_count}")
        logger.info(f"  - Courses: {courses_count}")
        logger.info(f"  - Branches: {branches_count}")
        logger.info(f"  - Divisions: {divisions_count}")
        logger.info(f"  - Enrollments: {enrollments_count}")
        logger.info(f"  - Attendance Records: {attendance_count}")
        
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {str(e)}")
    finally:
        session.close()


if __name__ == "__main__":
    main()
