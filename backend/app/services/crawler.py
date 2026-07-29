"""爬虫：含重试、限流、源切换、UA/Referer、代理池占位"""
import asyncio
import logging
import random
from typing import Optional, Dict, Any

import httpx

from app.config import get_settings
from app.services.crawl_source import (
    get_next_source,
    mark_source_failed,
    reset_source_failures,
    is_robots_allowed,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# 简易 rate limit（每源最近请求时间）
_last_request_at: Dict[str, float] = {}
_lock = asyncio.Lock()


async def respect_rate_limit(source_name: str, interval: Optional[float] = None) -> None:
    """按数据源名称做最小间隔限流"""
    interval = interval or settings.CRAWL_RATE_LIMIT_INTERVAL
    async with _lock:
        last = _last_request_at.get(source_name, 0)
        now = asyncio.get_event_loop().time()
        wait = interval - (now - last)
        if wait > 0:
            await asyncio.sleep(wait)
        _last_request_at[source_name] = asyncio.get_event_loop().time()


def _pick_proxy() -> Optional[str]:
    if not settings.CRAWL_PROXY_POOL:
        return None
    return random.choice(settings.CRAWL_PROXY_POOL)


async def fetch_with_retry(url: str, source_name: str) -> Optional[Dict[str, Any]]:
    """带重试的 GET 请求；遵守 rate_limit / robots / UA / Referer"""
    if settings.CRAWL_RESPECT_ROBOTS and not is_robots_allowed(url, settings.CRAWL_USER_AGENT):
        logger.warning(f"robots.txt 禁止访问: {url}")
        return None

    headers = {
        "User-Agent": settings.CRAWL_USER_AGENT,
        "Referer": settings.CRAWL_REFERER,
        "Accept": "application/json",
    }
    proxy = _pick_proxy()

    last_err: Optional[Exception] = None
    for attempt in range(1, settings.CRAWL_MAX_RETRIES + 1):
        try:
            await respect_rate_limit(source_name)
            async with httpx.AsyncClient(timeout=settings.CRAWL_TIMEOUT, proxy=proxy) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    reset_source_failures(source_name)
                    return resp.json()
                if resp.status_code in (429, 500, 502, 503, 504):
                    raise httpx.HTTPStatusError(
                        f"status={resp.status_code}", request=resp.request, response=resp
                    )
                # 4xx 非限流：不再重试
                logger.warning(f"非可重试状态码 {resp.status_code}: {url}")
                mark_source_failed(source_name)
                return None
        except Exception as e:
            last_err = e
            logger.warning(f"第 {attempt} 次重试失败({source_name}): {e}")
            await asyncio.sleep(settings.CRAWL_RETRY_DELAY * attempt)
    mark_source_failed(source_name)
    logger.error(f"达到最大重试次数 {settings.CRAWL_MAX_RETRIES}: {last_err}")
    return None


async def crawl_latest_draw() -> Optional[Dict[str, Any]]:
    """抓取最新一期开奖（带源切换）"""
    visited = set()
    while True:
        src = get_next_source()
        if not src or src.name in visited:
            logger.error("无可用数据源")
            return None
        visited.add(src.name)
        logger.info(f"使用数据源 {src.name} 抓取: {src.url}")
        data = await fetch_with_retry(src.url, src.name)
        if data:
            data["_source"] = src.name
            return data
