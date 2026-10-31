"""随机选号路由 —— 只生成随机号码，不做任何预测"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.schemas.picker import PickerOut, TicketOut
from app.services.picker import (
    DISCLAIMER,
    describe_rules,
    generate_tickets,
)

router = APIRouter()


@router.get("/generate", response_model=PickerOut)
def generate(
    count: int = Query(5, ge=1, le=20, description="生成注数"),
    max_consecutive: Optional[int] = Query(
        None, ge=1, le=5, description="前区最长连号上限（观感规则，不影响概率）"
    ),
    sum_min: Optional[int] = Query(None, ge=15, le=165, description="前区和值下限"),
    sum_max: Optional[int] = Query(None, ge=15, le=165, description="前区和值上限"),
):
    sum_range = None
    if sum_min is not None or sum_max is not None:
        if sum_min is None or sum_max is None:
            raise HTTPException(status_code=400, detail="sum_min 与 sum_max 必须同时提供")
        if sum_min > sum_max:
            raise HTTPException(status_code=400, detail="sum_min 不能大于 sum_max")
        sum_range = (sum_min, sum_max)

    try:
        tickets = generate_tickets(count, max_consecutive, sum_range)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return PickerOut(
        count=count,
        rules=describe_rules(max_consecutive, sum_range),
        tickets=[TicketOut(**t) for t in tickets],
        disclaimer=DISCLAIMER,
    )
