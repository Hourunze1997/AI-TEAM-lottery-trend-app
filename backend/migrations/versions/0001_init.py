"""init schema

Revision ID: 0001_init
Revises:
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa


revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "draws",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("period", sa.String(32), nullable=False),
        sa.Column("front_numbers", sa.JSON, nullable=False),
        sa.Column("back_numbers", sa.JSON, nullable=False),
        sa.Column("draw_date", sa.DateTime, nullable=False),
        sa.Column("source", sa.String(32), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=True),
        sa.UniqueConstraint("period", name="ix_draws_period"),
    )

    op.create_table(
        "number_frequencies",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("zone", sa.String(8), nullable=False),
        sa.Column("number", sa.Integer, nullable=False),
        sa.Column("range_days", sa.Integer, nullable=False),
        sa.Column("count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("miss", sa.Integer, nullable=False, server_default="0"),
        sa.Column("frequency", sa.Float, nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime, nullable=True),
        sa.UniqueConstraint("zone", "number", "range_days", name="uq_zone_number_range"),
    )

    op.create_table(
        "predictions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("target_period", sa.String(32), nullable=False),
        sa.Column("algorithm", sa.String(32), nullable=False),
        sa.Column("front_numbers", sa.JSON, nullable=False),
        sa.Column("back_numbers", sa.JSON, nullable=False),
        sa.Column("confidence", sa.Float, nullable=False, server_default="0"),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )

    op.create_table(
        "favorites",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, nullable=False),
        sa.Column("front_numbers", sa.JSON, nullable=False),
        sa.Column("back_numbers", sa.JSON, nullable=False),
        sa.Column("tag", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_favorites_user", "favorites", ["user_id"])

    op.create_table(
        "favorite_hits",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("favorite_id", sa.Integer, sa.ForeignKey("favorites.id", ondelete="CASCADE"), nullable=False),
        sa.Column("period", sa.String(32), nullable=False),
        sa.Column("front_hits", sa.Integer, nullable=False, server_default="0"),
        sa.Column("back_hits", sa.Integer, nullable=False, server_default="0"),
        sa.Column("prize_level", sa.String(16), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_favhit_favorite", "favorite_hits", ["favorite_id"])

    op.create_table(
        "user_notifications",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, nullable=False),
        sa.Column("draw_reminder_enabled", sa.Boolean, nullable=False, server_default=sa.text("0")),
        sa.Column("reminder_time", sa.String(8), nullable=True),
        sa.Column("push_token", sa.String(255), nullable=True),
        sa.Column("push_token_invalid", sa.Boolean, nullable=False, server_default=sa.text("0")),
        sa.Column("extra", sa.JSON, nullable=True),
        sa.Column("updated_at", sa.DateTime, nullable=True),
        sa.UniqueConstraint("user_id", name="ix_user_notif_user"),
    )


def downgrade() -> None:
    op.drop_table("user_notifications")
    op.drop_index("ix_favhit_favorite", table_name="favorite_hits")
    op.drop_table("favorite_hits")
    op.drop_index("ix_favorites_user", table_name="favorites")
    op.drop_table("favorites")
    op.drop_table("predictions")
    op.drop_table("number_frequencies")
    op.drop_table("draws")
