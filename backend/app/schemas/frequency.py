"""Frequency schema"""
from pydantic import BaseModel


class NumberFrequencyOut(BaseModel):
    zone: str
    number: int
    range: str
    count: int
    last_miss: int
    avg_gap: float

    class Config:
        from_attributes = True


class ZoneStatsOut(BaseModel):
    """奇偶/大小/连号统计"""
    zone: str
    range: str
    odd_even_ratio: dict  # {"odd": 60, "even": 40}
    big_small_ratio: dict
    consecutive_count: int
    max_consecutive: int
