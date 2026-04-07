"""Add attendance records index for race condition fix

Revision ID: f7e3c8d2b4a1
Revises: ed2ddd454888
Create Date: 2026-04-07 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f7e3c8d2b4a1'
down_revision = 'ed2ddd454888'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add index for efficient duplicate attendance lookup during race condition prevention
    # This index is used by SELECT FOR UPDATE query in attendance marking
    op.create_index(
        'idx_timetable_student_date',
        'attendance_records',
        ['timetable_id', 'student_id', 'marked_at'],
        unique=False,
    )


def downgrade() -> None:
    # Remove the index if rollback is needed
    op.drop_index('idx_timetable_student_date', table_name='attendance_records')
