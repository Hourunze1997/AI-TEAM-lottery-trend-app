"""APScheduler 启动/关闭 + missed-run 补跑"""
import logging
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor
from apscheduler.events import EVENT_JOB_MISSED

from app.config import get_settings
from app.jobs.jobs import (
    job_fetch_draw,
    job_check_hit_and_push,
    retry_missed_draws,
)

logger = logging.getLogger(__name__)
settings = get_settings()

_scheduler: Optional[AsyncIOScheduler] = None


def _on_missed(event):
    logger.warning(f"Missed job: {event.job_id} scheduled at {event.scheduled_run_time}")


async def start_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        return

    _scheduler = AsyncIOScheduler(
        jobstores={"default": MemoryJobStore()},
        executors={"default": AsyncIOExecutor()},
        timezone=settings.JOB_TIMEZONE,
    )
    _scheduler.add_listener(_on_missed, EVENT_JOB_MISSED)
    register_jobs(_scheduler)
    _scheduler.start()
    logger.info("Scheduler 启动完成")

    # 启动时补跑 missed
    try:
        await retry_missed_draws()
    except Exception as e:
        logger.exception(f"启动补跑失败: {e}")


async def shutdown_scheduler() -> None:
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler 已关闭")


def register_jobs(scheduler: AsyncIOScheduler) -> None:
    scheduler.add_job(
        job_fetch_draw,
        trigger="cron",
        **parse_cron(settings.JOB_FETCH_CRON),
        id="job_fetch_draw",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=600,
    )
    # +5min 触发命中比对
    scheduler.add_job(
        job_check_hit_and_push,
        trigger="cron",
        minute=f"{(21 + 0) % 60}",  # 默认 21:35；若 FETCH_CRON 含小时需解析
        hour="21,21,21",
        id="job_check_hit_and_push",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=600,
    )


def parse_cron(expr: str) -> dict:
    """解析简单 cron 表达式 'M H * * D'"""
    parts = expr.split()
    if len(parts) != 5:
        return {}
    minute, hour, day, month, dow = parts
    return {
        "minute": minute,
        "hour": hour,
        "day": day,
        "month": month,
        "day_of_week": dow,
    }
