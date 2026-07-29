"""Prediction schema"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


AlgorithmName = Literal["cold_hot", "missing", "mean_revert", "random"]


class PredictionOut(BaseModel):
    algorithm: AlgorithmName
    algorithm_label: str  # 中文名
    front_numbers: List[int] = Field(..., min_length=5, max_length=5)
    back_numbers: List[int] = Field(..., min_length=2, max_length=2)
    confidence: float = Field(..., ge=0.0, le=1.0)
    rationale: Optional[str] = None  # 简短说明


class PredictionListOut(BaseModel):
    target_period: str
    predictions: List[PredictionOut]
    generated_at: str
