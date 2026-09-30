"""Подтверждение роли пользователя

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-29
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: str = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TIMESTAMPTZ = sa.DateTime(timezone=True)


def upgrade() -> None:
    op.add_column("users", sa.Column("role_confirmed_at", TIMESTAMPTZ, nullable=True))


def downgrade() -> None:
    op.drop_column("users", "role_confirmed_at")
