"""Expo Push 发送 + receipt 回执 + DeviceNotRegistered 处理"""
import logging
from typing import List, Dict, Any

import httpx

from app.config import get_settings
from app.database import SessionLocal
from app.models.notification import UserNotification

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_push(
    tokens: List[str],
    title: str,
    body: str,
    data: Dict[str, Any] | None = None,
    sound: str = "default",
) -> List[str]:
    """发送 Expo push，返回 receipt id 列表"""
    if not tokens:
        return []
    valid = [t for t in tokens if t and t.startswith("ExponentPushToken")]
    if not valid:
        return []

    messages = [
        {
            "to": t,
            "title": title,
            "body": body,
            "sound": sound,
            "data": data or {},
        }
        for t in valid
    ]

    receipt_ids: List[str] = []
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                settings.EXPO_PUSH_URL,
                json=messages,
                headers={"Accept": "application/json", "Content-Type": "application/json"},
            )
            if resp.status_code != 200:
                logger.error(f"Expo push 失败 status={resp.status_code} body={resp.text[:200]}")
                return []
            data = resp.json()
            for item in data.get("data", []):
                if item.get("status") == "ok" and item.get("id"):
                    receipt_ids.append(item["id"])
                else:
                    logger.warning(f"推送单条失败: {item}")
    except Exception as e:
        logger.exception(f"send_push 异常: {e}")
    return receipt_ids


async def poll_receipts(receipt_ids: List[str]) -> None:
    """轮询 receipt，处理 DeviceNotRegistered 写回黑名单"""
    if not receipt_ids:
        return
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                settings.EXPO_RECEIPT_URL,
                json={"ids": receipt_ids},
                headers={"Accept": "application/json", "Content-Type": "application/json"},
            )
            if resp.status_code != 200:
                logger.warning(f"获取 receipt 失败: {resp.status_code}")
                return
            payload = resp.json().get("data", {})
            await handle_invalid_tokens(payload)
    except Exception as e:
        logger.exception(f"poll_receipts 异常: {e}")


async def handle_invalid_tokens(receipts: Dict[str, Any]) -> None:
    """根据 receipt 把 DeviceNotRegistered 的 token 标记为失效"""
    invalid: List[str] = []
    for receipt_id, info in receipts.items():
        if isinstance(info, dict):
            details = info.get("details", {}) or {}
            if details.get("error") == "DeviceNotRegistered":
                token = info.get("devicePushToken") or info.get("expoPushToken")
                if token:
                    invalid.append(token)
            elif info.get("status") == "error":
                logger.warning(f"receipt 错误: {info}")
    if not invalid:
        return

    db = SessionLocal()
    try:
        for t in invalid:
            rows = (
                db.query(UserNotification)
                .filter(UserNotification.push_token == t)
                .all()
            )
            for r in rows:
                r.push_token_invalid = True
        db.commit()
    finally:
        db.close()
