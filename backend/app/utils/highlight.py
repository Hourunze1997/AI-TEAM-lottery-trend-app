"""高亮工具：根据模式生成高亮集合"""
from typing import Optional, Set, List
from sqlalchemy.orm import Session

from app.models.draw import Draw
from app.models.favorite import Favorite
from app.models.prediction import Prediction


def build_highlight_set(
    mode: str,
    user_id: int,
    target_period: str,
    db: Optional[Session] = None,
) -> Set[int]:
    """根据 mode 构造高亮号码集合"""
    if mode == "favorites":
        return _from_favorites(user_id, db)
    if mode == "prediction":
        return _from_predictions(user_id, target_period, db)
    if mode == "latest":
        return _from_latest(db)
    return set()


def _from_favorites(user_id: int, db: Optional[Session]) -> Set[int]:
    if not db:
        return set()
    favs = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    out: Set[int] = set()
    for f in favs:
        out.update(f.front_numbers or [])
        out.update(f.back_numbers or [])
    return out


def _from_predictions(user_id: int, target_period: str, db: Optional[Session]) -> Set[int]:
    if not db:
        return set()
    preds = db.query(Prediction).filter(
        Prediction.user_id == user_id,
        Prediction.target_period == target_period,
    ).all()
    out: Set[int] = set()
    for p in preds:
        out.update(p.front_numbers or [])
        out.update(p.back_numbers or [])
    return out


def _from_latest(db: Optional[Session]) -> Set[int]:
    if not db:
        return set()
    d = db.query(Draw).order_by(Draw.draw_date.desc()).first()
    if not d:
        return set()
    out: Set[int] = set()
    out.update(d.front_numbers or [])
    out.update(d.back_numbers or [])
    return out


def serialize_highlight(s: Optional[Set[int]]) -> List[int]:
    return sorted(s) if s else []


def diff_zones(front_a: List[int], back_a: List[int], front_b: List[int], back_b: List[int]):
    """返回两组号码的差异"""
    return {
        "front_only_a": sorted(set(front_a) - set(front_b)),
        "front_only_b": sorted(set(front_b) - set(front_a)),
        "back_only_a": sorted(set(back_a) - set(back_b)),
        "back_only_b": sorted(set(back_b) - set(back_a)),
    }
