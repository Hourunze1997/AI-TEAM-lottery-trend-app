"""历史开奖路由"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.draw import Draw
from app.schemas.draw import DrawOut, DrawListItem, DrawListOut
from app.utils.highlight import build_highlight_set, serialize_highlight

router = APIRouter()


@router.get("", response_model=DrawListOut)
def list_draws(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    highlight: Optional[str] = Query(None, description="favorites|prediction|latest"),
    user_id: Optional[int] = None,
):
    q = db.query(Draw)
    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(Draw.period.like(like)))

    total = q.count()
    items = (
        q.order_by(Draw.draw_date.desc(), Draw.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    out_items: List[DrawListItem] = []
    for d in items:
        hi_set = None
        hi_mode = None
        if highlight and user_id:
            hi_set = build_highlight_set(highlight, user_id, d.period)
            hi_mode = highlight
        out_items.append(
            DrawListItem(
                id=d.id,
                period=d.period,
                draw_date=d.draw_date,
                front_numbers=d.front_numbers,
                back_numbers=d.back_numbers,
                prize_pool=d.prize_pool,
                highlight=serialize_highlight(hi_set) if hi_set else None,
                highlight_mode=hi_mode,
            )
        )
    return DrawListOut(items=out_items, total=total, page=page, page_size=page_size)


@router.get("/{period}", response_model=DrawOut)
def get_draw_by_period(
    period: str,
    db: Session = Depends(get_db),
    highlight: Optional[str] = Query(None),
    user_id: Optional[int] = None,
):
    d = db.query(Draw).filter(Draw.period == period).first()
    if not d:
        raise HTTPException(status_code=404, detail="期号不存在")

    hi_set = None
    if highlight and user_id:
        hi_set = build_highlight_set(highlight, user_id, d.period)

    return DrawOut(
        id=d.id,
        period=d.period,
        draw_date=d.draw_date,
        front_numbers=d.front_numbers,
        back_numbers=d.back_numbers,
        prize_pool=d.prize_pool,
        source=d.source,
        highlight=serialize_highlight(hi_set) if hi_set else None,
        highlight_mode=highlight,
    )
