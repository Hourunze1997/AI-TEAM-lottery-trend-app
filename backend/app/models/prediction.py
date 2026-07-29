"""Prediction ORM（仅用于审计）"""
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Prediction(Base):
    """预测记录（可选审计）"""

    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # user_id 是 JWT 里的 opaque int，auth router 用的是内存 _USERS dict，
    # 没有 users 表 → 不加 FK 约束。nullable=True 允许系统级预测（无 user）。
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    target_period: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    algorithm: Mapped[str] = mapped_column(String(32), nullable=False)  # cold_hot/missing/mean_revert/random
    front_numbers: Mapped[list] = mapped_column(JSON, nullable=False)
    back_numbers: Mapped[list] = mapped_column(JSON, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.utcnow()
    )
