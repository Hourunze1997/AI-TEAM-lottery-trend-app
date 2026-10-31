"""具体 job 实现"""
import asyncio
import logging
from datetime import datetime
from typing import Optional

from app.database import SessionLocal
from app.models.draw import Draw
from app.services.crawler import crawl_latest_draw
from app.services.hit_checker import (
    check_favorite_hits,
    notify_hits,
)
from app.services.analyzer import rebuild_frequencies
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# 重试状态（内存）
_retry_state: dict[str, int] = {}


async def job_fetch_draw(period: Optional[str] = None) -> None:
    """抓取最新开奖；失败按 5min 间隔重试至多 3 次"""
    logger.info(f"job_fetch_draw 启动 period={period}")
    try:
        data = await crawl_latest_draw()
    except Exception as e:
        logger.exception(f"抓取异常: {e}")
        data = None

    if not data:
        key = period or "latest"
        cnt = _retry_state.get(key, 0)
        if cnt < settings.JOB_MISS_RETRY_LIMIT:
            _retry_state[key] = cnt + 1
            logger.warning(f"抓取失败，{settings.JOB_MISS_RETRY_INTERVAL}s 后重试 ({cnt + 1}/{settings.JOB_MISS_RETRY_LIMIT})")
            await asyncio.sleep(settings.JOB_MISS_RETRY_INTERVAL)
            await job_fetch_draw(period)
        else:
            logger.error(f"抓取最终失败 key={key}")
            _retry_state.pop(key, None)
        return

    _retry_state.pop(period or "latest", None)
    _persist_draw(data)
    rebuild_frequencies(SessionLocal(), range_key="all")


def _persist_draw(data: dict) -> None:
    db = SessionLocal()
    try:
        period = str(data.get("period"))
        if db.query(Draw).filter(Draw.period == period).first():
            logger.info(f"期号 {period} 已存在，跳过")
            return
        d = Draw(
            period=period,
            draw_date=datetime.fromisoformat(data["draw_date"].replace("Z", "+00:00")) if isinstance(data.get("draw_date"), str) else datetime.utcnow(),
            front_numbers=sorted(data.get("front_numbers", [])),
            back_numbers=sorted(data.get("back_numbers", [])),
            prize_pool=data.get("prize_pool"),
            source=data.get("_source", "primary"),
        )
        db.add(d)
        db.commit()
        logger.info(f"期号 {period} 入库成功")
    except Exception as e:
        logger.exception(f"持久化开奖失败: {e}")
        db.rollback()
    finally:
        db.close()


async def job_check_hit_and_push() -> None:
    """开奖后比对 + 推送"""
    logger.info("job_check_hit_and_push 启动")
    db = SessionLocal()
    try:
        latest = db.query(Draw).order_by(Draw.draw_date.desc()).first()
        if not latest:
            logger.warning("无最新开奖，跳过命中比对")
            return
        fav_hits = check_favorite_hits(db, latest)
        if fav_hits:
            await notify_hits(db, fav_hits)
    finally:
        db.close()


async def retry_missed_draws() -> None:
    """启动时补跑：检查最近一次抓取时间"""
    logger.info("retry_missed_draws 启动")
    db = SessionLocal()
    try:
        latest = db.query(Draw).order_by(Draw.draw_date.desc()).first()
        if latest and (datetime.utcnow() - latest.created_at).total_seconds() < 7 * 86400:
            return
        await job_fetch_draw()
    finally:
        db.close()
