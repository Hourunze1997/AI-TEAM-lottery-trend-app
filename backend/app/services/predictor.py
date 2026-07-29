"""四种预测算法 + 固定顺序入口"""
import math
import random
from typing import List, Tuple, Dict, Optional

from app.models.draw import Draw
from app.utils.scoring import (
    normalize_cold_hot,
    normalize_missing,
    normalize_mean_revert,
    clip_confidence,
)

FRONT_MIN, FRONT_MAX, FRONT_PICK = 1, 35, 5
BACK_MIN, BACK_MAX, BACK_PICK = 1, 12, 2


def _safe_choice(pool: List[int], k: int) -> List[int]:
    pool = sorted(set(pool))
    if len(pool) <= k:
        return pool
    return random.sample(pool, k)


def predict_cold_hot(draws: List[Draw]) -> Tuple[List[int], List[int], float, str]:
    """冷热号：选出现次数最多的 top-K + 归一化置信度"""
    if not draws:
        return [], [], 0.0, "冷热号：暂无数据"

    front_count = {}
    back_count = {}
    for d in draws:
        for n in d.front_numbers:
            front_count[n] = front_count.get(n, 0) + 1
        for n in d.back_numbers:
            back_count[n] = back_count.get(n, 0) + 1

    front_sorted = sorted(front_count.items(), key=lambda x: -x[1])
    back_sorted = sorted(back_count.items(), key=lambda x: -x[1])

    front = [n for n, _ in front_sorted[:FRONT_PICK]]
    back = [n for n, _ in back_sorted[:BACK_PICK]]

    # 补足（数据不足时随机补）
    if len(front) < FRONT_PICK:
        pool = [n for n in range(FRONT_MIN, FRONT_MAX + 1) if n not in front]
        front += _safe_choice(pool, FRONT_PICK - len(front))
    if len(back) < BACK_PICK:
        pool = [n for n in range(BACK_MIN, BACK_MAX + 1) if n not in back]
        back += _safe_choice(pool, BACK_PICK - len(back))

    confidence = normalize_cold_hot(front_count, front)
    return sorted(front[:FRONT_PICK]), sorted(back[:BACK_PICK]), confidence, "冷热号：按历史出现频次排序"


def predict_missing(draws: List[Draw]) -> Tuple[List[int], List[int], float, str]:
    """遗漏值：选 last_miss 最大的号码"""
    if not draws:
        return [], [], 0.0, "遗漏：暂无数据"

    last_idx = {}
    for idx, d in enumerate(draws):
        for n in d.front_numbers:
            last_idx[("front", n)] = idx
        for n in d.back_numbers:
            last_idx[("back", n)] = idx

    total = len(draws)

    def miss(zone: str, n: int) -> int:
        return total - last_idx.get((zone, n), -1) - 1

    front_miss = [(n, miss("front", n)) for n in range(FRONT_MIN, FRONT_MAX + 1)]
    back_miss = [(n, miss("back", n)) for n in range(BACK_MIN, BACK_MAX + 1)]

    front_miss.sort(key=lambda x: -x[1])
    back_miss.sort(key=lambda x: -x[1])

    front = [n for n, _ in front_miss[:FRONT_PICK]]
    back = [n for n, _ in back_miss[:BACK_PICK]]

    avg_miss = (
        sum(m for _, m in front_miss[:FRONT_PICK]) / FRONT_PICK
        + sum(m for _, m in back_miss[:BACK_PICK]) / BACK_PICK
    ) / 2

    confidence = normalize_missing(avg_miss)
    return sorted(front), sorted(back), confidence, "遗漏：选距上次出现期数最长的号码"


def predict_mean_revert(draws: List[Draw]) -> Tuple[List[int], List[int], float, str]:
    """均值回归：选 z-score 偏离最大的号码"""
    if not draws:
        return [], [], 0.0, "均值回归：暂无数据"

    def stats(zone: str, k: int, lo: int, hi: int):
        counts = {n: 0 for n in range(lo, hi + 1)}
        for d in draws:
            nums = d.front_numbers if zone == "front" else d.back_numbers
            for n in nums:
                if n in counts:
                    counts[n] += 1
        vals = list(counts.values())
        mean = sum(vals) / len(vals) if vals else 0
        var = sum((v - mean) ** 2 for v in vals) / len(vals) if vals else 0
        std = math.sqrt(var) or 1.0
        z = {n: (c - mean) / std for n, c in counts.items()}
        return z

    fz = stats("front", FRONT_PICK, FRONT_MIN, FRONT_MAX)
    bz = stats("back", BACK_PICK, BACK_MIN, BACK_MAX)

    # 偏离最远的（绝对值最大，且倾向选择低于均值的：均值回归假设会回升）
    front_sorted = sorted(fz.items(), key=lambda x: x[1])  # 升序：低 → 高
    back_sorted = sorted(bz.items(), key=lambda x: x[1])
    front = [n for n, _ in front_sorted[:FRONT_PICK]]
    back = [n for n, _ in back_sorted[:BACK_PICK]]

    # 置信度：基于 z 偏离度
    abs_z = [abs(z) for _, z in front_sorted[:FRONT_PICK]] + [abs(z) for _, z in back_sorted[:BACK_PICK]]
    avg_abs_z = sum(abs_z) / len(abs_z) if abs_z else 0.0
    confidence = normalize_mean_revert(avg_abs_z)

    return sorted(front), sorted(back), confidence, "均值回归：偏离均值最远号码预期回归"


def predict_random(seed: Optional[int] = None) -> Tuple[List[int], List[int], float, str]:
    """纯随机：固定 confidence=0.10"""
    if seed is not None:
        random.seed(seed)
    front = sorted(random.sample(range(FRONT_MIN, FRONT_MAX + 1), FRONT_PICK))
    back = sorted(random.sample(range(BACK_MIN, BACK_MAX + 1), BACK_PICK))
    return front, back, clip_confidence(0.10), "随机：固定置信度 0.10，仅供参考"


def predict_all_ordered(draws: List[Draw]) -> List[Dict]:
    """固定顺序：cold_hot → missing → mean_revert → random"""
    front1, back1, conf1, r1 = predict_cold_hot(draws)
    front2, back2, conf2, r2 = predict_missing(draws)
    front3, back3, conf3, r3 = predict_mean_revert(draws)
    front4, back4, conf4, r4 = predict_random()

    return [
        {"algorithm": "cold_hot", "algorithm_label": "冷热号",
         "front_numbers": front1, "back_numbers": back1, "confidence": conf1, "rationale": r1},
        {"algorithm": "missing", "algorithm_label": "遗漏值",
         "front_numbers": front2, "back_numbers": back2, "confidence": conf2, "rationale": r2},
        {"algorithm": "mean_revert", "algorithm_label": "均值回归",
         "front_numbers": front3, "back_numbers": back3, "confidence": conf3, "rationale": r3},
        {"algorithm": "random", "algorithm_label": "随机",
         "front_numbers": front4, "back_numbers": back4, "confidence": conf4, "rationale": r4},
    ]
