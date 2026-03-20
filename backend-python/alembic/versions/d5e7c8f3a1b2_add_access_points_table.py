"""add_access_points_table

Revision ID: d5e7c8f3a1b2
Revises: 2eb4c0ac2af1
Create Date: 2024-01-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = "d5e7c8f3a1b2"
down_revision: Union[str, None] = "2eb4c0ac2af1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "access_points",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("location_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("mac_address", sa.String(length=17), nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["location_id"], ["locations.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("mac_address"),
    )
    op.create_index(op.f("ix_access_points_id"), "access_points", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_access_points_id"), table_name="access_points")
    op.drop_table("access_points")
