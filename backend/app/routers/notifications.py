"""通知路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user_id
from app.models.notification import UserNotification
from app.schemas.notification import (
    NotificationSettingsIn,
    NotificationSettingsOut,
    PushTokenIn,
)

router = APIRouter()


def _get_or_create(db: Session, user_id: int) -> UserNotification:
    n = db.query(UserNotification).filter(UserNotification.user_id == user_id).first()
    if not n:
        n = UserNotification(user_id=user_id)
        db.add(n)
        db.commit()
        db.refresh(n)
    return n


@router.put("/settings", response_model=NotificationSettingsOut)
def update_settings(
    payload: NotificationSettingsIn,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    n = _get_or_create(db, user_id)
    n.draw_reminder_enabled = payload.draw_reminder_enabled
    n.reminder_time = payload.reminder_time
    n.hit_notification_enabled = payload.hit_notification_enabled
    db.commit()
    db.refresh(n)
    return NotificationSettingsOut(
        user_id=user_id,
        draw_reminder_enabled=n.draw_reminder_enabled,
        reminder_time=n.reminder_time,
        hit_notification_enabled=n.hit_notification_enabled,
        has_push_token=bool(n.push_token and not n.push_token_invalid),
    )


@router.get("/settings", response_model=NotificationSettingsOut)
def get_settings(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    n = _get_or_create(db, user_id)
    return NotificationSettingsOut(
        user_id=user_id,
        draw_reminder_enabled=n.draw_reminder_enabled,
        reminder_time=n.reminder_time,
        hit_notification_enabled=n.hit_notification_enabled,
        has_push_token=bool(n.push_token and not n.push_token_invalid),
    )


@router.post("/push-token")
def register_push_token(
    payload: PushTokenIn,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not payload.push_token.startswith("ExponentPushToken"):
        raise HTTPException(status_code=400, detail="仅接受 Expo push_token")
    n = _get_or_create(db, user_id)
    n.push_token = payload.push_token
    n.push_token_invalid = False
    db.commit()
    return {"ok": True}
