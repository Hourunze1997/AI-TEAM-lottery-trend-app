"""Favorite schema"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class FavoriteCreate(BaseModel):
    front_numbers: List[int] = Field(..., min_length=5, max_length=5)
    back_numbers: List[int] = Field(..., min_length=2, max_length=2)
    tag: Optional[str] = None


class FavoriteOut(BaseModel):
    id: int
    user_id: int
    front_numbers: List[int]
    back_numbers: List[int]
    tag: Optional[str] = None
    hit_count: int = 0
    best_rank: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HitStat(BaseModel):
    favorite_id: int
    front_numbers: List[int]
    back_numbers: List[int]
    hit_count: int
    best_rank: Optional[str] = None
    last_hit_period: Optional[str] = None
    last_hit_at: Optional[datetime] = None
