"""initialize schema

Revision ID: 2eb4c0ac2af1
Revises:
Create Date: 2026-01-19 20:27:32.695691

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "2eb4c0ac2af1"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial schema."""
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    if dialect_name == "postgresql":
        created_at_default = sa.text("NOW()")
        updated_at_default = sa.text("NOW()")
    else:
        created_at_default = sa.text("CURRENT_TIMESTAMP")
        updated_at_default = sa.text("CURRENT_TIMESTAMP")

    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("first_name", sa.String(), nullable=False),
        sa.Column("last_name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_phone"), "users", ["phone"], unique=True)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    # Courses table
    op.create_table(
        "courses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("code", sa.String(length=10), nullable=False),
        sa.Column("duration_years", sa.Integer(), nullable=False),
        sa.Column("total_semesters", sa.Integer(), nullable=False),
        sa.Column("college_code", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_courses_code"), "courses", ["code"], unique=True)
    op.create_index(op.f("ix_courses_college_code"), "courses", ["college_code"], unique=False)
    op.create_index(op.f("ix_courses_id"), "courses", ["id"], unique=False)
    op.create_index(op.f("ix_courses_name"), "courses", ["name"], unique=False)

    # Branches table
    op.create_table(
        "branches",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("code", sa.String(length=10), nullable=False),
        sa.Column("branch_code", sa.String(length=5), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_branches_branch_code"), "branches", ["branch_code"], unique=True)
    op.create_index(op.f("ix_branches_code"), "branches", ["code"], unique=True)
    op.create_index(op.f("ix_branches_course_id"), "branches", ["course_id"], unique=False)
    op.create_index(op.f("ix_branches_id"), "branches", ["id"], unique=False)
    op.create_index(op.f("ix_branches_name"), "branches", ["name"], unique=False)

    # Divisions table
    op.create_table(
        "divisions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("branch_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=10), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("semester", sa.Integer(), nullable=False),
        sa.Column("academic_year", sa.String(length=20), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_divisions_branch_id"), "divisions", ["branch_id"], unique=False)
    op.create_index(op.f("ix_divisions_id"), "divisions", ["id"], unique=False)
    op.create_index(op.f("ix_divisions_name"), "divisions", ["name"], unique=False)

    # Batches table
    op.create_table(
        "batches",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("division_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("batch_number", sa.Integer(), nullable=False),
        sa.Column("semester", sa.Integer(), nullable=False),
        sa.Column("academic_year", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.ForeignKeyConstraint(["division_id"], ["divisions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_batches_division_id"), "batches", ["division_id"], unique=False)
    op.create_index(op.f("ix_batches_id"), "batches", ["id"], unique=False)
    op.create_index(op.f("ix_batches_name"), "batches", ["name"], unique=False)

    # Locations table
    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("radius", sa.Integer(), nullable=True),
        sa.Column("room_no", sa.String(length=20), nullable=True),
        sa.Column("floor", sa.Integer(), nullable=True),
        sa.Column("room_type", sa.String(length=20), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_locations_id"), "locations", ["id"], unique=False)
    op.create_index(op.f("ix_locations_name"), "locations", ["name"], unique=True)

    # Timetables table
    op.create_table(
        "timetables",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("division_id", sa.Integer(), nullable=False),
        sa.Column("teacher_id", sa.Integer(), nullable=False),
        sa.Column("location_id", sa.Integer(), nullable=False),
        sa.Column("subject", sa.String(length=100), nullable=False),
        sa.Column("lecture_type", sa.String(length=20), nullable=False),
        sa.Column("batch_id", sa.Integer(), nullable=True),
        sa.Column("day_of_week", sa.String(length=20), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("semester", sa.Integer(), nullable=False),
        sa.Column("academic_year", sa.String(length=20), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.ForeignKeyConstraint(["batch_id"], ["batches.id"]),
        sa.ForeignKeyConstraint(["division_id"], ["divisions.id"]),
        sa.ForeignKeyConstraint(["location_id"], ["locations.id"]),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_timetables_division_id"), "timetables", ["division_id"], unique=False)
    op.create_index(op.f("ix_timetables_id"), "timetables", ["id"], unique=False)
    op.create_index(op.f("ix_timetables_teacher_id"), "timetables", ["teacher_id"], unique=False)

    # Student enrollments table
    op.create_table(
        "student_enrollments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("branch_id", sa.Integer(), nullable=False),
        sa.Column("division_id", sa.Integer(), nullable=False),
        sa.Column("current_year", sa.Integer(), nullable=False),
        sa.Column("current_semester", sa.Integer(), nullable=True),
        sa.Column("enrollment_number", sa.String(length=20), nullable=False),
        sa.Column("enrollment_date", sa.Date(), nullable=False),
        sa.Column("academic_year", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("has_kt", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"]),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"]),
        sa.ForeignKeyConstraint(["division_id"], ["divisions.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_enrollments_division_id"), "student_enrollments", ["division_id"], unique=False)
    op.create_index(op.f("ix_student_enrollments_enrollment_number"), "student_enrollments", ["enrollment_number"], unique=True)
    op.create_index(op.f("ix_student_enrollments_id"), "student_enrollments", ["id"], unique=False)
    op.create_index(op.f("ix_student_enrollments_student_id"), "student_enrollments", ["student_id"], unique=True)

    # QR codes table
    op.create_table(
        "qr_codes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("timetable_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.ForeignKeyConstraint(["timetable_id"], ["timetables.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_qr_codes_id"), "qr_codes", ["id"], unique=False)

    # OTP codes table
    op.create_table(
        "otp_codes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("timetable_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.ForeignKeyConstraint(["timetable_id"], ["timetables.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_otp_codes_id"), "otp_codes", ["id"], unique=False)

    # Attendance records table
    op.create_table(
        "attendance_records",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("timetable_id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("enrollment_id", sa.Integer(), nullable=False),
        sa.Column("teacher_id", sa.Integer(), nullable=False),
        sa.Column("division_id", sa.Integer(), nullable=False),
        sa.Column("batch_id", sa.Integer(), nullable=True),
        sa.Column("location_id", sa.Integer(), nullable=False),
        sa.Column("marked_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("device_info", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=created_at_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=updated_at_default),
        sa.ForeignKeyConstraint(["batch_id"], ["batches.id"]),
        sa.ForeignKeyConstraint(["division_id"], ["divisions.id"]),
        sa.ForeignKeyConstraint(["enrollment_id"], ["student_enrollments.id"]),
        sa.ForeignKeyConstraint(["location_id"], ["locations.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["timetable_id"], ["timetables.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_attendance_records_id"), "attendance_records", ["id"], unique=False)
    op.create_index(op.f("ix_attendance_records_student_id"), "attendance_records", ["student_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_attendance_records_student_id"), table_name="attendance_records")
    op.drop_index(op.f("ix_attendance_records_id"), table_name="attendance_records")
    op.drop_table("attendance_records")

    op.drop_index(op.f("ix_otp_codes_id"), table_name="otp_codes")
    op.drop_table("otp_codes")

    op.drop_index(op.f("ix_qr_codes_id"), table_name="qr_codes")
    op.drop_table("qr_codes")

    op.drop_index(op.f("ix_student_enrollments_student_id"), table_name="student_enrollments")
    op.drop_index(op.f("ix_student_enrollments_enrollment_number"), table_name="student_enrollments")
    op.drop_index(op.f("ix_student_enrollments_id"), table_name="student_enrollments")
    op.drop_index(op.f("ix_student_enrollments_division_id"), table_name="student_enrollments")
    op.drop_table("student_enrollments")

    op.drop_index(op.f("ix_timetables_teacher_id"), table_name="timetables")
    op.drop_index(op.f("ix_timetables_id"), table_name="timetables")
    op.drop_index(op.f("ix_timetables_division_id"), table_name="timetables")
    op.drop_table("timetables")

    op.drop_index(op.f("ix_locations_name"), table_name="locations")
    op.drop_index(op.f("ix_locations_id"), table_name="locations")
    op.drop_table("locations")

    op.drop_index(op.f("ix_batches_name"), table_name="batches")
    op.drop_index(op.f("ix_batches_id"), table_name="batches")
    op.drop_index(op.f("ix_batches_division_id"), table_name="batches")
    op.drop_table("batches")

    op.drop_index(op.f("ix_divisions_name"), table_name="divisions")
    op.drop_index(op.f("ix_divisions_id"), table_name="divisions")
    op.drop_index(op.f("ix_divisions_branch_id"), table_name="divisions")
    op.drop_table("divisions")

    op.drop_index(op.f("ix_branches_name"), table_name="branches")
    op.drop_index(op.f("ix_branches_id"), table_name="branches")
    op.drop_index(op.f("ix_branches_course_id"), table_name="branches")
    op.drop_index(op.f("ix_branches_code"), table_name="branches")
    op.drop_index(op.f("ix_branches_branch_code"), table_name="branches")
    op.drop_table("branches")

    op.drop_index(op.f("ix_courses_name"), table_name="courses")
    op.drop_index(op.f("ix_courses_id"), table_name="courses")
    op.drop_index(op.f("ix_courses_college_code"), table_name="courses")
    op.drop_index(op.f("ix_courses_code"), table_name="courses")
    op.drop_table("courses")

    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_phone"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
