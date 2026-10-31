#!/usr/bin/env python3
"""大乐透"预测算法"回测 —— 用真实开奖数据检验它们是否比纯随机更强。

背景：本仓库曾内置四种"预测/推荐算法"（冷热号/遗漏值/均值回归/纯随机），
其原实现与 git 历史中 backend/app/services/predictor.py 等价，副本内联在下方。
本脚本按生产同款方式（routers/predictions.py 曾用"最近 120 期"窗口）逐期生成
预测，与真实开奖比对。

数据：scripts/dlt_history.json，2941 期真实开奖（2007-05-30 ~ 2026-10-28），
来源 500.com 公开页面，另经独立数据源对 1913 个重叠期逐期核对，0 期不一致。

运行 `python3 scripts/backtest.py` 可复现的结论：
1. 2014 年之后，四种算法与纯随机统计上无法区分（成对 z 检验 |z| < 2）；
2. 全历史中冷热号的表面优势（z≈+5）来自 2007-2014 年官方开奖数据中
   前区 29-35 号系统性偏多（占比 27~28%，均匀应为 20%），该异常 2014 年后消失；
3. 全部 11284 注预测头奖命中 0 次。彩票返奖率约 50%，任何选号方式
   都不改变期望回报 —— 这也是本仓库移除"预测"框架、只保留随机选号的原因。

用法：
    python3 scripts/backtest.py                 # 全历史 + 2014 年后 两张表
    python3 scripts/backtest.py --reps 50       # 降低随机基线模拟次数（更快）
"""
import argparse
import json
import math
import random
from collections import defaultdict
from pathlib import Path

FRONT_MIN, FRONT_MAX, FRONT_PICK = 1, 35, 5
BACK_MIN, BACK_MAX, BACK_PICK = 1, 12, 2
WINDOW = 120  # 生产曾用窗口：最近 120 期


# ---------------------------------------------------------------------------
# 已移除的四种"预测算法"原实现副本（等价于 git 历史的 predictor.py）
# ---------------------------------------------------------------------------

def predict_cold_hot(draws):
    """冷热号：选出现次数最多的 top-K"""
    front_count, back_count = defaultdict(int), defaultdict(int)
    for d in draws:
        for n in d["front"]:
            front_count[n] += 1
        for n in d["back"]:
            back_count[n] += 1
    front = [n for n, _ in sorted(front_count.items(), key=lambda x: (-x[1], x[0]))][:FRONT_PICK]
    back = [n for n, _ in sorted(back_count.items(), key=lambda x: (-x[1], x[0]))][:BACK_PICK]
    return sorted(front), sorted(back)


def predict_missing(draws):
    """遗漏值：选距上次出现期数最长的号码"""
    last_idx = {}
    for idx, d in enumerate(draws):  # draws 升序（旧 → 新）
        for n in d["front"]:
            last_idx[("front", n)] = idx
        for n in d["back"]:
            last_idx[("back", n)] = idx
    total = len(draws)

    def miss(zone, n):
        return total - last_idx.get((zone, n), -1) - 1

    front = sorted(range(FRONT_MIN, FRONT_MAX + 1), key=lambda n: -miss("front", n))[:FRONT_PICK]
    back = sorted(range(BACK_MIN, BACK_MAX + 1), key=lambda n: -miss("back", n))[:BACK_PICK]
    return sorted(front), sorted(back)


def predict_mean_revert(draws):
    """均值回归：选 z-score 偏离最大（低于均值）的号码"""

    def lowest_z(lo, hi, pick, field):
        counts = {n: 0 for n in range(lo, hi + 1)}
        for d in draws:
            for n in d[field]:
                if n in counts:
                    counts[n] += 1
        vals = list(counts.values())
        mean = sum(vals) / len(vals)
        std = math.sqrt(sum((v - mean) ** 2 for v in vals) / len(vals)) or 1.0
        return sorted(counts, key=lambda n: (counts[n] - mean) / std)[:pick]

    return sorted(lowest_z(FRONT_MIN, FRONT_MAX, FRONT_PICK, "front")), \
        sorted(lowest_z(BACK_MIN, BACK_MAX, BACK_PICK, "back"))


def predict_random(rng):
    """纯随机"""
    return (sorted(rng.sample(range(FRONT_MIN, FRONT_MAX + 1), FRONT_PICK)),
            sorted(rng.sample(range(BACK_MIN, BACK_MAX + 1), BACK_PICK)))


# ---------------------------------------------------------------------------
# 回测
# ---------------------------------------------------------------------------

WIN_COMBOS = {(5, 2), (5, 1), (5, 0), (4, 2), (4, 1), (3, 2), (4, 0),
              (3, 1), (2, 2), (3, 0), (1, 2), (2, 1), (0, 2)}


def run_backtest(draws, min_date, reps, seed=42):
    rng = random.Random(seed)
    targets = [d for d in range(WINDOW, len(draws)) if draws[d]["date"] >= min_date]
    stats = {a: {"f": [], "b": [], "win": 0} for a in
             ("cold_hot", "missing", "mean_revert", "random")}
    rand_f, rand_b, rand_win = [], [], 0.0

    for i in targets:
        act_f, act_b = set(draws[i]["front"]), set(draws[i]["back"])
        window = draws[i - WINDOW:i]  # 升序，同生产
        for algo, fn in (("cold_hot", predict_cold_hot),
                         ("missing", predict_missing),
                         ("mean_revert", predict_mean_revert)):
            pf, pb = fn(window)
            f, b = len(set(pf) & act_f), len(set(pb) & act_b)
            stats[algo]["f"].append(f)
            stats[algo]["b"].append(b)
            stats[algo]["win"] += (f, b) in WIN_COMBOS
        pf, pb = predict_random(rng)
        f, b = len(set(pf) & act_f), len(set(pb) & act_b)
        stats["random"]["f"].append(f)
        stats["random"]["b"].append(b)
        stats["random"]["win"] += (f, b) in WIN_COMBOS

        rf = rb = 0
        for _ in range(reps):
            f = len(set(rng.sample(range(FRONT_MIN, FRONT_MAX + 1), FRONT_PICK)) & act_f)
            b = len(set(rng.sample(range(BACK_MIN, BACK_MAX + 1), BACK_PICK)) & act_b)
            rf += f
            rb += b
            rand_win += (f, b) in WIN_COMBOS
        rand_f.append(rf / reps)
        rand_b.append(rb / reps)

    _report(draws, targets, stats, rand_f, rand_b, rand_win)


def _report(draws, targets, stats, rand_f, rand_b, rand_win):
    n = len(rand_f)
    p_front = {k: math.comb(5, k) * math.comb(30, 5 - k) / math.comb(35, 5) for k in range(6)}
    p_back = {k: math.comb(2, k) * math.comb(10, 2 - k) / math.comb(12, 2) for k in range(3)}
    p_win = sum(p_front[f] * p_back[b] for f in range(6) for b in range(3) if (f, b) in WIN_COMBOS)
    print(f'区间 {draws[targets[0]]["date"]} ~ {draws[targets[-1]]["date"]}  目标期数 {n}'
          f'  理论随机: 前区 {25/35:.3f} / 后区 {4/12:.3f} / 任意中奖 {p_win*100:.2f}%')
    print(f'{"算法":<12}{"前区命中":>9}{"z(前区)":>8}{"后区命中":>9}{"z(后区)":>8}{"中奖次数":>9}{"期望":>7}')
    exp_win = n * p_win

    def mean(xs):
        return sum(xs) / len(xs)

    def pz(xs, base):
        d = [x - y for x, y in zip(xs, base)]
        m = mean(d)
        var = max(sum(v * v for v in d) / len(d) - m * m, 1e-12)
        return m / (var ** 0.5 / len(d) ** 0.5)

    for a, s in stats.items():
        print(f'{a:<12}{mean(s["f"]):>9.4f}{pz(s["f"], rand_f):>8.2f}'
              f'{mean(s["b"]):>9.4f}{pz(s["b"], rand_b):>8.2f}{s["win"]:>9}{exp_win:>7.0f}')
    print()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=200, help="每期随机基线模拟次数")
    args = ap.parse_args()

    data_path = Path(__file__).parent / "dlt_history.json"
    draws = json.loads(data_path.read_text())
    draws.sort(key=lambda d: d["date"])
    print(f'数据 {len(draws)} 期（{draws[0]["date"]} ~ {draws[-1]["date"]}），窗口 {WINDOW} 期\n')
    print("== 全历史 ==")
    run_backtest(draws, "0000-01-01", args.reps)
    print("== 2014 年之后（异常期消失，最接近当下）==")
    run_backtest(draws, "2014-01-01", args.reps)


if __name__ == "__main__":
    main()
