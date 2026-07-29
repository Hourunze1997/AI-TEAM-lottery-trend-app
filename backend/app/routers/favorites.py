"""收藏路由"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user_id
from app.models.favorite import Favorite, FavoriteHit
from app.schemas.favorite import FavoriteCreate, FavoriteOut, HitStat

router = APIRouter()


def _validate_numbers(front: List[int], back: List[int]):
    if len(front) != 5 or len(back) != 2:
        raise HTTPException(status_code=400, detail="前区必须5个号码，后区必须2个号码")
    if any(n < 1 or n > 35 for n in front):
        raise HTTPException(status_code=400, detail="前区号码范围 1-35")
    if any(n < 1 or n > 12 for n in back):
        raise HTTPException(status_code=400, detail="后区号码范围 1-12")
    if len(set(front)) != 5 or len(set(back)) != 2:
        raise HTTPException(status_code=400, detail="号码不能重复")


@router.post("", response_model=FavoriteOut, status_code=status.HTTP_201_CREATED)
def create_favorite(
    payload: FavoriteCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    _validate_numbers(payload.front_numbers, payload.back_numbers)
    fav = Favorite(
        user_id=user_id,
        front_numbers=sorted(payload.front_numbers),
        back_numbers=sorted(payload.back_numbers),
        tag=payload.tag,
    )
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


@router.get("", response_model=List[FavoriteOut])
def list_favorites(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
        .all()
    )


@router.delete("/{favorite_id}")
def delete_favorite(
    favorite_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(Favorite)
        .filter(Favorite.id == favorite_id, Favorite.user_id == user_id)
        .first()
    )
    if not fav:
        raise HTTPException(status_code=404, detail="收藏不存在")
    db.query(FavoriteHit).filter(FavoriteHit.favorite_id == favorite_id).delete()
    db.delete(fav)
    db.commit()
    return {"ok": True}


@router.get("/hit-stats", response_model=List[HitStat])
def hit_stats(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    favs = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    out: List[HitStat] = []
    for f in favs:
        last_hit = (
            db.query(FavoriteHit)
            .filter(FavoriteHit.favorite_id == f.id)
            .order_by(FavoriteHit.created_at.desc())
            .first()
        )
        out.append(
            HitStat(
                favorite_id=f.id,
                front_numbers=f.front_numbers,
                back_numbers=f.back_numbers,
                hit_count=f.hit_count,
                best_rank=f.best_rank,
                last_hit_period=last_hit.draw_period if last_hit else None,
                last_hit_at=last_hit.created_at if last_hit else None,
            )
        )
    return out
