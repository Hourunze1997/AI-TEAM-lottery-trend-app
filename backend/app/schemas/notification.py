"""Notification schema"""
from pydantic import BaseModel, Field


class NotificationSettingsIn(BaseModel):
    draw_reminder_enabled: bool = False
    reminder_time: str = Field(default="21:00", pattern=r"^\d{2}:\d{2}$")
    hit_notification_enabled: bool = True


class NotificationSettingsOut(BaseModel):
    user_id: int
    draw_reminder_enabled: bool
    reminder_time: str
    hit_notification_enabled: bool
    has_push_token: bool


class PushTokenIn(BaseModel):
    push_token: str = Field(..., min_length=10)
