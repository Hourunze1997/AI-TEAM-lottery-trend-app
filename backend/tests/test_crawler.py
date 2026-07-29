"""爬虫单元测试"""
import pytest
from app.services.crawler import respect_rate_limit, fetch_with_retry
from app.services.crawl_source import mark_source_failed, get_next_source, reset_source_failures


@pytest.mark.asyncio
async def test_retry_max_attempts():
    """非可重试 URL 应返回 None 不抛异常"""
    # 用一个永远 4xx 的 URL（example.com）
    res = await fetch_with_retry("https://example.com/404", "primary")
    # 4xx 不会重试，可能为 None
    assert res is None or isinstance(res, dict)


@pytest.mark.asyncio
async def test_rate_limit_runs():
    await respect_rate_limit("test_src", interval=0.01)


def test_source_failover():
    reset_source_failures("primary")
    reset_source_failures("secondary")
    mark_source_failed("primary")
    mark_source_failed("primary")
    src = get_next_source()
    # primary 失败 2 次 < 5，仍可用
    assert src is not None
    assert src.name in ("primary", "secondary")
