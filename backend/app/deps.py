"""依赖注入"""
from typing import Optional
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import get_token_payload


def get_current_user_id(payload: dict = Depends(get_token_payload)) -> int:
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="token 缺少 sub")
    try:
        return int(sub)
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="token sub 非法")


def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> dict:
    """根据 user_id 返回当前用户基本信息；用户表不在本方案范围内，返回字典占位"""
    # 实际项目应查 User ORM；此处只返回标识
    return {"id": user_id}


def get_current_push_token(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Optional[str]:
    """获取用户当前 push_token（占位实现）"""
    from app.models.notification import UserNotification

    n = db.query(UserNotification).filter(UserNotification.user_id == user_id).first()
    return n.push_token if n else None
