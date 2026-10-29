"""add booking timestamps and unique walker account links

Revision ID: 3a7f9c1d2e54
Revises: d59b73583987
Create Date: 2026-10-29
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "3a7f9c1d2e54"
down_revision: Union[str, None] = "d59b73583987"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("created_at", sa.DateTime(timezone=True), nullable=True))
    op.execute(sa.text("UPDATE bookings SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
    with op.batch_alter_table("bookings") as batch_op:
        batch_op.alter_column(
            "created_at",
            existing_type=sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.current_timestamp(),
        )
    op.create_index("ix_walkers_user_id_unique", "walkers", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_walkers_user_id_unique", table_name="walkers")
    with op.batch_alter_table("bookings") as batch_op:
        batch_op.drop_column("created_at")
