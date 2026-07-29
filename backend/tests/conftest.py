"""pytest fixtures"""
import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# 允许从 backend 目录运行
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SYNC_DATABASE_URL"] = "sqlite:///:memory:"

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.security import create_access_token  # noqa: E402


@pytest.fixture(autouse=True)
def _disable_scheduler(monkeypatch):
    """FastAPI lifespan 会 await start_scheduler()，里面 retry_missed_draws()
    会查 Draw 表；测试用 :memory: 时 SessionLocal() 拿不到 conftest 创建的
    表，会抛 no such table。把 scheduler 关掉避免启动期跑后台 job。
    """
    import app.jobs.scheduler as sched
    async def _noop():
        return None
    monkeypatch.setattr(sched, "start_scheduler", _noop)
    monkeypatch.setattr(sched, "shutdown_scheduler", _noop)


@pytest.fixture(scope="function")
def db_engine():
    # StaticPool + check_same_thread=False 让所有 Session 共享同一个 :memory: 连接，
    # 否则 conftest 这边 create_all 建好的表，scheduler / SessionLocal 看不到。
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    Session = sessionmaker(bind=db_engine)
    s = Session()
    try:
        yield s
    finally:
        s.close()


@pytest.fixture(scope="function")
def client(db_engine):
    Session = sessionmaker(bind=db_engine)

    def _override():
        s = Session()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_header():
    token = create_access_token(1)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def fake_draws(db_session):
    from app.models.draw import Draw
    from datetime import datetime, timedelta
    base = datetime(2024, 1, 1)
    rows = []
    for i in range(5):
        d = Draw(
            period=f"202400{i+1}",
            draw_date=base + timedelta(days=i),
            front_numbers=[1 + i, 2 + i, 3 + i, 4 + i, 5 + i],
            back_numbers=[1, 2],
            prize_pool=100_000_000,
        )
        db_session.add(d)
        rows.append(d)
    db_session.commit()
    return rows
