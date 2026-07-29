"""预测推荐路由 - 固定顺序 cold_hot → missing → mean_revert → random"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.draw import Draw
from app.schemas.prediction import PredictionListOut, PredictionOut
from app.services.predictor import predict_all_ordered

router = APIRouter()


@router.get("/next", response_model=PredictionListOut)
def get_next_predictions(
    db: Session = Depends(get_db),
    target_period: str = Query(..., description="目标期号"),
):
    # 拉最近若干期作为输入
    draws = (
        db.query(Draw)
        .order_by(Draw.draw_date.desc())
        .limit(120)
        .all()
    )
    draws = list(reversed(draws))

    predictions = predict_all_ordered(draws)
    out = [
        PredictionOut(
            algorithm=p["algorithm"],
            algorithm_label=p["algorithm_label"],
            front_numbers=p["front_numbers"],
            back_numbers=p["back_numbers"],
            confidence=p["confidence"],
            rationale=p.get("rationale"),
        )
        for p in predictions
    ]
    return PredictionListOut(
        target_period=target_period,
        predictions=out,
        generated_at=datetime.utcnow().isoformat() + "Z",
    )
