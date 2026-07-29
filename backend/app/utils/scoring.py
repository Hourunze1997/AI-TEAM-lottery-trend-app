"""confidence 归一化"""
import math
from typing import Dict, List


def clip_confidence(x: float) -> float:
    return max(0.0, min(1.0, x))


def normalize_cold_hot(counts: Dict[int, int], selected: List[int]) -> float:
    """频次 → [0,1]；count 越高分越高（sigmoid）"""
    if not selected or not counts:
        return 0.0
    total = sum(counts.values()) or 1
    avg_freq = sum(counts.get(n, 0) for n in selected) / len(selected)
    ratio = avg_freq / (total / max(len(counts), 1))
    # ratio ≈ 1 表示平均；>1 表示高频；用 sigmoid 映射
    return clip_confidence(1.0 / (1.0 + math.exp(-2 * (ratio - 1))))


def normalize_missing(avg_miss: float) -> float:
    """avg_miss 越大 → 置信度越高（1/(1+miss)）"""
    if avg_miss <= 0:
        return 0.0
    return clip_confidence(1.0 / (1.0 + avg_miss))


def normalize_mean_revert(avg_abs_z: float) -> float:
    """z 越大 → 置信度越高（sigmoid）"""
    return clip_confidence(1.0 / (1.0 + math.exp(-avg_abs_z)))
