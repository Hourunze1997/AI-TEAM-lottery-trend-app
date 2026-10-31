"""命中比对"""
import logging
from typing import List, Dict
from sqlalchemy.orm import Session

from app.models.draw import Draw
from app.models.favorite import Favorite, FavoriteHit
from app.models.notification import UserNotification
from app.services.push_service import send_push

logger = logging.getLogger(__name__)


def _rank(front_hit: int, back_hit: int) -> str:
    """根据命中数估算奖项等级"""
    if front_hit == 5 and back_hit == 2:
        return "一等奖"
    if front_hit == 5 and back_hit == 1:
        return "二等奖"
    if front_hit == 5 and back_hit == 0:
        return "三等奖"
    if front_hit == 4 and back_hit == 2:
        return "四等奖"
    if front_hit == 4 and back_hit == 1:
        return "五等奖"
    if front_hit == 3 and back_hit == 2:
        return "六等奖"
    if front_hit == 4 and back_hit == 0:
        return "七等奖"
    if front_hit == 3 and back_hit == 1:
        return "八等奖"
    if front_hit == 2 and back_hit == 2:
        return "八等奖"
    if front_hit == 3 and back_hit == 0:
        return "九等奖"
    if front_hit == 1 and back_hit == 2:
        return "九等奖"
    if front_hit == 2 and back_hit == 1:
        return "九等奖"
    if front_hit == 0 and back_hit == 2:
        return "九等奖"
    return ""


def check_favorite_hits(db: Session, draw: Draw) -> List[Dict]:
    """对所有用户的 favorite 计算命中"""
    results = []
    favorites = db.query(Favorite).all()
    for fav in favorites:
        front_hit = len(set(fav.front_numbers) & set(draw.front_numbers))
        back_hit = len(set(fav.back_numbers) & set(draw.back_numbers))
        rank = _rank(front_hit, back_hit)

        if rank:
            fav.hit_count = (fav.hit_count or 0) + 1
            if not fav.best_rank:
                fav.best_rank = rank
            hit = FavoriteHit(
                favorite_id=fav.id,
                draw_period=draw.period,
                front_hit=front_hit,
                back_hit=back_hit,
                rank=rank,
            )
            db.add(hit)
            results.append({
                "user_id": fav.user_id,
                "favorite_id": fav.id,
                "rank": rank,
                "front_hit": front_hit,
                "back_hit": back_hit,
            })
    db.commit()
    return results


async def notify_hits(db: Session, hits: List[Dict]):
    """向命中用户发推送"""
    if not hits:
        return
    user_ids = {h["user_id"] for h in hits}
    for uid in user_ids:
        n = db.query(UserNotification).filter(UserNotification.user_id == uid).first()
        if not n or not n.push_token or n.push_token_invalid:
            continue
        if not n.hit_notification_enabled:
            continue
        user_hits = [h for h in hits if h["user_id"] == uid]
        best = sorted(
            user_hits,
            key=lambda h: (h.get("rank", ""), -h["front_hit"] - h["back_hit"]),
        )[0]
        try:
            await send_push(
                tokens=[n.push_token],
                title=f"命中 {best['rank']}",
                body=f"前区命中 {best['front_hit']}，后区命中 {best['back_hit']}",
                data={"kind": "favorite_hit", "rank": best["rank"]},
            )
        except Exception as e:
            logger.error(f"发送推送失败 user={uid}: {e}")
