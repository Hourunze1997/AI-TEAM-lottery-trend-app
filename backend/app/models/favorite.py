"""Favorite ORM + Hit 关联表"""
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Favorite(Base):
    """收藏号码"""

    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    front_numbers: Mapped[list] = mapped_column(JSON, nullable=False)
    back_numbers: Mapped[list] = mapped_column(JSON, nullable=False)
    tag: Mapped[str | None] = mapped_column(String(64), nullable=True)
    hit_count: Mapped[int] = mapped_column(Integer, default=0)  # 命中次数累计
    best_rank: Mapped[str | None] = mapped_column(String(16), nullable=True)  # 一等奖/二等奖...

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.utcnow()
    )

    __table_args__ = (
        Index("ix_favorites_user_created", "user_id", "created_at"),
    )


class FavoriteHit(Base):
    """收藏命中明细"""

    __tablename__ = "favorite_hits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    favorite_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("favorites.id", ondelete="CASCADE"), index=True, nullable=False
    )
    draw_period: Mapped[str] = mapped_column(String(32), nullable=False)
    front_hit: Mapped[int] = mapped_column(Integer, default=0)
    back_hit: Mapped[int] = mapped_column(Integer, default=0)
    rank: Mapped[str | None] = mapped_column(String(16), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.utcnow()
    )

    __table_args__ = (
        UniqueConstraint("favorite_id", "draw_period", name="uq_favhit_fav_period"),
    )
