"""Draw ORM"""
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Draw(Base):
    """开奖记录"""

    __tablename__ = "draws"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    period: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    draw_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    front_numbers: Mapped[list] = mapped_column(JSON, nullable=False)  # [n1..n5] sorted
    back_numbers: Mapped[list] = mapped_column(JSON, nullable=False)   # [n1, n2] sorted
    prize_pool: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(64), default="primary")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.utcnow()
    )

    __table_args__ = (
        Index("ix_draws_draw_date", "draw_date"),
    )

    def __repr__(self) -> str:
        return f"<Draw {self.period}>"
