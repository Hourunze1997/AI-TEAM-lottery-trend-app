"""pytest fixtures"""
import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 允许从 backend 目录运行
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SYNC_DATABASE_URL"] = "sqlite:///:memory:"

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.security import create_access_token  # noqa: E402


@pytest.fixture(scope="function")
def db_engine():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
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
