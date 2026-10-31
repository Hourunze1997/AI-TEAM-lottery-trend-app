"""随机选号服务 —— 纯随机 + 透明观感规则。

诚实边界（写在代码里，不许删）：
- 开奖号码完全随机，任何选号方式（包括本服务）都不改变中奖概率；
- 观感规则（连号上限/和值范围）只影响号码"看着顺不顺眼"，不影响期望回报；
- 曾有四种"预测算法"（冷热号/遗漏值/均值回归/随机），经 2821 期真实开奖
  回测证实与纯随机无法区分（2014 年后 |z|<2，0 次头奖），已全部移除。
  回测脚本与结论见 scripts/backtest.py。
"""
import random
from typing import List, Optional, Tuple

FRONT_MIN, FRONT_MAX, FRONT_PICK = 1, 35, 5
BACK_MIN, BACK_MAX, BACK_PICK = 1, 12, 2

DISCLAIMER = "开奖号码完全随机，选号工具不提升中奖概率；彩票长期返奖率约 50%，请理性投注。"

_MAX_ATTEMPTS = 1000


def _max_run(nums: List[int]) -> int:
    """最长连续号段长度，如 [3,4,5,9,12] → 3"""
    best = run = 1
    for a, b in zip(nums, nums[1:]):
        run = run + 1 if b == a + 1 else 1
        best = max(best, run)
    return best


def _passes_rules(
    front: List[int],
    max_consecutive: Optional[int],
    sum_range: Optional[Tuple[int, int]],
) -> bool:
    if max_consecutive is not None and _max_run(front) > max_consecutive:
        return False
    if sum_range is not None:
        lo, hi = sum_range
        if not (lo <= sum(front) <= hi):
            return False
    return True


def generate_ticket(
    max_consecutive: Optional[int] = None,
    sum_range: Optional[Tuple[int, int]] = None,
    rng: Optional[random.Random] = None,
) -> Tuple[List[int], List[int]]:
    """生成一注（前区 5 个 1-35，后区 2 个 1-12），拒绝采样满足观感规则"""
    rng = rng if rng is not None else random
    for _ in range(_MAX_ATTEMPTS):
        front = sorted(rng.sample(range(FRONT_MIN, FRONT_MAX + 1), FRONT_PICK))
        if _passes_rules(front, max_consecutive, sum_range):
            back = sorted(rng.sample(range(BACK_MIN, BACK_MAX + 1), BACK_PICK))
            return front, back
    raise ValueError("观感规则过严，无法生成号码，请放宽 max_consecutive / sum_range")


def generate_tickets(
    count: int,
    max_consecutive: Optional[int] = None,
    sum_range: Optional[Tuple[int, int]] = None,
    seed: Optional[int] = None,
) -> List[dict]:
    """生成 count 注随机号码（seed 仅用于测试可复现）"""
    rng = random.Random(seed) if seed is not None else random
    out = []
    for _ in range(count):
        front, back = generate_ticket(max_consecutive, sum_range, rng)
        out.append({"front_numbers": front, "back_numbers": back})
    return out


def describe_rules(
    max_consecutive: Optional[int], sum_range: Optional[Tuple[int, int]]
) -> dict:
    """把生效中的观感规则原样回显给调用方，附不影响概率的说明"""
    rules: dict = {}
    if max_consecutive is not None:
        rules["max_consecutive"] = max_consecutive
    if sum_range is not None:
        rules["sum_range"] = list(sum_range)
    if rules:
        rules["note"] = "以上是观感规则，只改变号码外观，不影响中奖概率"
    return rules
