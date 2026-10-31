"""drop predictions 表（预测框架已移除，见 scripts/backtest.py 的回测结论）

Revision ID: 0002_drop_predictions
Revises: 0001_init
Create Date: 2026-10-31
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_drop_predictions"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_predictions_target_period", table_name="predictions")
    op.drop_index("ix_predictions_user_id", table_name="predictions")
    op.drop_table("predictions")


def downgrade() -> None:
    op.create_table(
        "predictions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("target_period", sa.String(length=32), nullable=False),
        sa.Column("algorithm", sa.String(length=32), nullable=False),
        sa.Column("front_numbers", sa.JSON(), nullable=False),
        sa.Column("back_numbers", sa.JSON(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_predictions_user_id", "predictions", ["user_id"])
    op.create_index("ix_predictions_target_period", "predictions", ["target_period"])
