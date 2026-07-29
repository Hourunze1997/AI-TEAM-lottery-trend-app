"""Draw schema"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class DrawListItem(BaseModel):
    id: int
    period: str
    draw_date: datetime
    front_numbers: List[int]
    back_numbers: List[int]
    prize_pool: Optional[int] = None
    highlight: Optional[List[int]] = None  # 高亮号码（已序列化）
    highlight_mode: Optional[str] = None

    class Config:
        from_attributes = True


class DrawOut(BaseModel):
    id: int
    period: str
    draw_date: datetime
    front_numbers: List[int]
    back_numbers: List[int]
    prize_pool: Optional[int] = None
    source: Optional[str] = None
    highlight: Optional[List[int]] = None
    highlight_mode: Optional[str] = None
    highlight_meta: Optional[dict] = None  # 额外元数据(对比来源等)

    class Config:
        from_attributes = True


class DrawListOut(BaseModel):
    items: List[DrawListItem]
    total: int
    page: int
    page_size: int
