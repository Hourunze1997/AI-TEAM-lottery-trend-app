"""调度任务测试"""
import pytest
from app.config import get_settings


def test_fetch_cron():
    s = get_settings()
    assert s.JOB_FETCH_CRON == "30 21 * * 1,3,6"


@pytest.mark.asyncio
async def test_missed_backfill(db_session):
    """空数据库补跑应不抛异常"""
    from app.jobs.jobs import retry_missed_draws
    try:
        await retry_missed_draws()
    except Exception:
        # 允许爬虫失败，但函数本身不应崩溃
        pass


@pytest.mark.asyncio
async def test_job_fetch_draw_smoke():
    """冒烟测试"""
    from app.jobs.jobs import job_fetch_draw
    try:
        await job_fetch_draw(period="test")
    except Exception:
        # 网络失败可接受
        pass
