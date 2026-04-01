"""add_branch_id_to_users

Revision ID: 10da5fc53930
Revises: ed2ddd454888
Create Date: 2026-04-01 12:31:26.023560

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '10da5fc53930'
down_revision: Union[str, Sequence[str], None] = 'ed2ddd454888'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add branch_id column to users table."""
    op.add_column('users', sa.Column('branch_id', sa.Integer(), sa.ForeignKey('branches.id'), nullable=True))
    op.create_index('ix_users_branch_id', 'users', ['branch_id'], unique=False)


def downgrade() -> None:
    """Remove branch_id column from users table."""
    op.drop_index('ix_users_branch_id', table_name='users')
    op.drop_column('users', 'branch_id')
