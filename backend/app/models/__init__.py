"""聚合 ORM 模型，供 Alembic autogenerate"""
from app.database import Base
from app.models.draw import Draw
from app.models.frequency import NumberFrequency
from app.models.favorite import Favorite, FavoriteHit
from app.models.notification import UserNotification

__all__ = [
    "Base",
    "Draw",
    "NumberFrequency",
    "Favorite",
    "FavoriteHit",
    "UserNotification",
]
