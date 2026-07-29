"""应用配置"""
from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class CrawlSourceConfig:
    """数据源配置（合规开关、降级顺序）"""

    def __init__(self, name: str, url: str, priority: int, enabled: bool = True):
        self.name = name
        self.url = url
        self.priority = priority
        self.enabled = enabled


DEFAULT_SOURCES: List[CrawlSourceConfig] = [
    CrawlSourceConfig(
        name="primary",
        url="https://api.example.com/lotto/draws",
        priority=1,
        enabled=True,
    ),
    CrawlSourceConfig(
        name="secondary",
        url="https://backup.example.com/lotto/draws",
        priority=2,
        enabled=True,
    ),
    CrawlSourceConfig(
        name="fallback",
        url="https://mirror.example.com/lotto/draws",
        priority=3,
        enabled=True,
    ),
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # 基础
    APP_NAME: str = "lotto-predictor"
    LOG_LEVEL: str = "INFO"
    ENV: str = "development"
    CORS_ORIGINS: List[str] = ["*"]
    REQUEST_ID_HEADER: str = "X-Request-ID"

    # 数据库
    DATABASE_URL: str = "sqlite+aiosqlite:///./lotto.db"
    SYNC_DATABASE_URL: str = "sqlite:///./lotto.db"

    # JWT
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 天

    # 爬虫
    CRAWL_USER_AGENT: str = "LottoPredictor/1.0 (+contact@example.com)"
    CRAWL_REFERER: str = "https://example.com"
    CRAWL_TIMEOUT: float = 10.0
    CRAWL_MAX_RETRIES: int = 3
    CRAWL_RETRY_DELAY: float = 2.0
    CRAWL_RATE_LIMIT_INTERVAL: float = 1.5  # 秒
    CRAWL_RESPECT_ROBOTS: bool = True
    CRAWL_PROXY_POOL: List[str] = []  # 占位，预留代理池接口

    # 数据源
    CRAWL_SOURCES: List[dict] = Field(default_factory=lambda: [
        {"name": s.name, "url": s.url, "priority": s.priority, "enabled": s.enabled}
        for s in DEFAULT_SOURCES
    ])

    # Scheduler
    JOB_TIMEZONE: str = "Asia/Shanghai"
    JOB_FETCH_CRON: str = "30 21 * * 1,3,6"  # 周一、三、六 21:30
    JOB_HIT_DELAY_MINUTES: int = 5
    JOB_MISS_RETRY_LIMIT: int = 3
    JOB_MISS_RETRY_INTERVAL: int = 300  # 秒

    # Expo Push
    EXPO_PUSH_URL: str = "https://exp.host/--/api/v2/push/send"
    EXPO_RECEIPT_URL: str = "https://exp.host/--/api/v2/push/receipts"


@lru_cache
def get_settings() -> Settings:
    return Settings()


def crawl_sources_table() -> List[CrawlSourceConfig]:
    """获取数据源配置表"""
    settings = get_settings()
    return [
        CrawlSourceConfig(**src)
        for src in settings.CRAWL_SOURCES
        if src.get("enabled", True)
    ]
