"""随机选号 schema"""
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class TicketOut(BaseModel):
    front_numbers: List[int] = Field(..., min_length=5, max_length=5)
    back_numbers: List[int] = Field(..., min_length=2, max_length=2)


class PickerOut(BaseModel):
    count: int
    rules: Dict = {}  # 生效中的观感规则；空 = 纯随机
    tickets: List[TicketOut]
    disclaimer: str
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
