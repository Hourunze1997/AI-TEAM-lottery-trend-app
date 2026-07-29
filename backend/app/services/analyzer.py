"""走势分析服务"""
from typing import List, Dict
from collections import Counter
from sqlalchemy.orm import Session

from app.models.draw import Draw
from app.models.frequency import NumberFrequency
from app.schemas.frequency import ZoneStatsOut


FRONT_MIN, FRONT_MAX = 1, 35
BACK_MIN, BACK_MAX = 1, 12
FRONT_PICK, BACK_PICK = 5, 2


def _slice_draws_by_range(draws: List[Draw], range_key: str) -> List[Draw]:
    if range_key == "all":
        return draws
    try:
        n = int(range_key)
        return draws[-n:]
    except ValueError:
        return draws


def rebuild_frequencies(db: Session, range_key: str = "all") -> None:
    """重新计算所有号码频次"""
    draws = db.query(Draw).order_by(Draw.draw_date.asc()).all()
    sub = _slice_draws_by_range(draws, range_key)

    # 前区
    front_counts = Counter()
    back_counts = Counter()
    front_last_idx: Dict[int, int] = {}
    back_last_idx: Dict[int, int] = {}
    front_gaps: Dict[int, list] = {n: [] for n in range(FRONT_MIN, FRONT_MAX + 1)}
    back_gaps: Dict[int, list] = {n: [] for n in range(BACK_MIN, BACK_MAX + 1)}

    for idx, d in enumerate(sub):
        for n in d.front_numbers:
            front_counts[n] += 1
            if n in front_last_idx:
                front_gaps[n].append(idx - front_last_idx[n])
            front_last_idx[n] = idx
        for n in d.back_numbers:
            back_counts[n] += 1
            if n in back_last_idx:
                back_gaps[n].append(idx - back_last_idx[n])
            back_last_idx[n] = idx

    total = len(sub)

    # 删除旧数据
    db.query(NumberFrequency).filter(NumberFrequency.range_key == range_key).delete()

    # 前区
    for n in range(FRONT_MIN, FRONT_MAX + 1):
        last_miss = total - front_last_idx.get(n, -1) - 1
        gaps = front_gaps[n]
        avg_gap = (sum(gaps) / len(gaps)) if gaps else float(total or 1)
        db.add(NumberFrequency(
            zone="front", number=n, range_key=range_key,
            count=front_counts.get(n, 0), last_miss=last_miss, avg_gap=avg_gap,
        ))

    # 后区
    for n in range(BACK_MIN, BACK_MAX + 1):
        last_miss = total - back_last_idx.get(n, -1) - 1
        gaps = back_gaps[n]
        avg_gap = (sum(gaps) / len(gaps)) if gaps else float(total or 1)
        db.add(NumberFrequency(
            zone="back", number=n, range_key=range_key,
            count=back_counts.get(n, 0), last_miss=last_miss, avg_gap=avg_gap,
        ))

    db.commit()


def compute_odd_even(zone: str, draws: List[Draw]) -> Dict[str, int]:
    odd = even = 0
    for d in draws:
        nums = d.front_numbers if zone == "front" else d.back_numbers
        for n in nums:
            if n % 2 == 1:
                odd += 1
            else:
                even += 1
    return {"odd": odd, "even": even}


def compute_big_small(zone: str, draws: List[Draw]) -> Dict[str, int]:
    """以中位数为分界"""
    if zone == "front":
        boundary = (FRONT_MIN + FRONT_MAX) // 2
    else:
        boundary = (BACK_MIN + BACK_MAX) // 2
    big = small = 0
    for d in draws:
        nums = d.front_numbers if zone == "front" else d.back_numbers
        for n in nums:
            if n > boundary:
                big += 1
            else:
                small += 1
    return {"big": big, "small": small}


def compute_consecutive(zone: str, draws: List[Draw]) -> Dict[str, int]:
    """统计连号出现次数与最大连号长度"""
    consecutive_count = 0
    max_consecutive = 0
    for d in draws:
        nums = sorted(d.front_numbers if zone == "front" else d.back_numbers)
        cur = 1
        local_max = 1
        for i in range(1, len(nums)):
            if nums[i] - nums[i - 1] == 1:
                cur += 1
                local_max = max(local_max, cur)
            else:
                cur = 1
        if local_max >= 2:
            consecutive_count += 1
        max_consecutive = max(max_consecutive, local_max)
    return {"consecutive_count": consecutive_count, "max_consecutive": max_consecutive}


def compute_zone_stats(zone: str, draws: List[Draw]) -> ZoneStatsOut:
    return ZoneStatsOut(
        zone=zone,
        range=str(len(draws)),
        odd_even_ratio=compute_odd_even(zone, draws),
        big_small_ratio=compute_big_small(zone, draws),
        consecutive_count=compute_consecutive(zone, draws)["consecutive_count"],
        max_consecutive=compute_consecutive(zone, draws)["max_consecutive"],
    )
