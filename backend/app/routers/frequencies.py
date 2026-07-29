"""走势统计路由"""
from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.draw import Draw
from app.models.frequency import NumberFrequency
from app.schemas.frequency import NumberFrequencyOut, ZoneStatsOut
from app.services.analyzer import rebuild_frequencies, compute_zone_stats

router = APIRouter()


@router.get("", response_model=List[NumberFrequencyOut])
def get_frequencies(
    db: Session = Depends(get_db),
    zone: str = Query("front", pattern="^(front|back)$"),
    range: str = Query("all", pattern="^(30|60|all)$"),
    refresh: bool = Query(False, description="强制重新计算"),
):
    if refresh:
        rebuild_frequencies(db, range_key=range)

    rows = (
        db.query(NumberFrequency)
        .filter(NumberFrequency.zone == zone, NumberFrequency.range_key == range)
        .order_by(NumberFrequency.number.asc())
        .all()
    )
    if not rows:
        rebuild_frequencies(db, range_key=range)
        rows = (
            db.query(NumberFrequency)
            .filter(NumberFrequency.zone == zone, NumberFrequency.range_key == range)
            .order_by(NumberFrequency.number.asc())
            .all()
        )

    return [
        NumberFrequencyOut(
            zone=r.zone, number=r.number, range=r.range_key,
            count=r.count, last_miss=r.last_miss, avg_gap=r.avg_gap,
        )
        for r in rows
    ]


@router.get("/stats", response_model=ZoneStatsOut)
def get_zone_stats(
    db: Session = Depends(get_db),
    zone: str = Query("front", pattern="^(front|back)$"),
    range: int = Query(30, ge=1, le=500),
):
    draws = (
        db.query(Draw)
        .order_by(Draw.draw_date.desc())
        .limit(range)
        .all()
    )
    draws = list(reversed(draws))
    if not draws:
        raise HTTPException(status_code=404, detail="暂无数据")
    return compute_zone_stats(zone, draws)
