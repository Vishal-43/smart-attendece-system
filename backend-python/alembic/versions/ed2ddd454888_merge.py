"""merge

Revision ID: ed2ddd454888
Revises: c9f3f76e2a11, d5e7c8f3a1b2
Create Date: 2026-04-01 12:29:03.266634

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed2ddd454888'
down_revision: Union[str, Sequence[str], None] = ('c9f3f76e2a11', 'd5e7c8f3a1b2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
