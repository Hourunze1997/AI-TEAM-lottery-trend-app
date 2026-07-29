"""SQLAlchemy 数据库配置"""
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

from app.config import get_settings


class Base(DeclarativeBase):
    """ORM 基类"""
    pass


settings = get_settings()

# 同步引擎（爬虫/后台 job 使用）
engine = create_engine(
    settings.SYNC_DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI 依赖：获取 DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
