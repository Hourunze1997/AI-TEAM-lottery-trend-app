"""NumberFrequency ORM"""
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Float, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class NumberFrequency(Base):
    """号码冷热频次（按时间范围聚合）"""

    __tablename__ = "number_frequencies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    zone: Mapped[str] = mapped_column(String(8), nullable=False)  # front / back
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    range_key: Mapped[str] = mapped_column(String(16), default="all")  # 30/60/all
    count: Mapped[int] = mapped_column(Integer, default=0)
    last_miss: Mapped[int] = mapped_column(Integer, default=0)  # 距上次出现的期数
    avg_gap: Mapped[float] = mapped_column(Float, default=0.0)
    detail: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.utcnow()
    )

    __table_args__ = (
        UniqueConstraint("zone", "number", "range_key", name="uq_freq_zone_number_range"),
    )
