"""Notification ORM"""
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserNotification(Base):
    """用户通知设置"""

    __tablename__ = "user_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, unique=True, index=True, nullable=False)

    # 提醒开关
    draw_reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_time: Mapped[str] = mapped_column(String(8), default="21:00")  # HH:MM

    # 命中通知
    hit_notification_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    # Expo push_token
    push_token: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    push_token_invalid: Mapped[bool] = mapped_column(Boolean, default=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.utcnow,
        onupdate=lambda: datetime.utcnow,
    )
