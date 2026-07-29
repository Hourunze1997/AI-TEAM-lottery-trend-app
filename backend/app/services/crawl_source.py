"""数据源配置与切换"""
import urllib.robotparser
from typing import List, Optional
from threading import Lock

from app.config import crawl_sources_table, CrawlSourceConfig

_lock = Lock()
_failure_counts: dict[str, int] = {}


def list_sources() -> List[CrawlSourceConfig]:
    return crawl_sources_table()


def get_next_source() -> Optional[CrawlSourceConfig]:
    """按 priority 升序选择下一个可用源"""
    sources = sorted(list_sources(), key=lambda s: s.priority)
    for s in sources:
        if _failure_counts.get(s.name, 0) < 5:  # 失败 5 次后暂时跳过
            return s
    # 全部失败 → 重置计数，选第一个
    with _lock:
        _failure_counts.clear()
    return sources[0] if sources else None


def mark_source_failed(name: str) -> None:
    with _lock:
        _failure_counts[name] = _failure_counts.get(name, 0) + 1


def reset_source_failures(name: str) -> None:
    with _lock:
        _failure_counts[name] = 0


def is_robots_allowed(url: str, user_agent: str = "*") -> bool:
    """校验 robots.txt（简化实现）"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(user_agent, url)
    except Exception:
        # 网络异常时保守放行（生产可改为 False）
        return True
