"""Prediction ORM（仅用于审计）"""
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Prediction(Base):
    """预测记录（可选审计）"""

    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    target_period: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    algorithm: Mapped[str] = mapped_column(String(32), nullable=False)  # cold_hot/missing/mean_revert/random
    front_numbers: Mapped[list] = mapped_column(JSON, nullable=False)
    back_numbers: Mapped[list] = mapped_column(JSON, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.utcnow
    )
