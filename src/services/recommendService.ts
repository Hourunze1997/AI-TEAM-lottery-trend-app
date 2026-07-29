import { NumberStat, RecommendSet, Weights } from '../models/types';
import {
  FRONT_RANGE,
  BACK_RANGE,
  FRONT_ZONES,
  BACK_ZONES,
  DEFAULT_WEIGHTS,
} from '../utils/constants';
import { shuffle, range, uuid, sum, avg } from '../utils/helpers';

// 单号打分
export function scoreNumber(stat: NumberStat, weights: Weights): number {
  // 频次越高越好 -> 归一化频次
  const freqScore = Math.min(stat.frequency / 20, 1);
  // 遗漏越接近均值越好（补偿遗漏）
  const missingScore =
    stat.avgMissing > 0
      ? Math.max(0, 1 - Math.abs(stat.missing - stat.avgMissing) / (stat.avgMissing + 1))
      : 0.5;
  // 热号加成
  const hotBonus = stat.hot ? 0.1 : 0;

  return (
    freqScore * weights.frequency +
    missingScore * weights.missing +
    (0.5 + hotBonus) * weights.zoneBalance
  );
}

// 推荐一组（综合频次、遗漏、冷热）
export function generateRecommend(
  stats: NumberStat[],
  k = 5,
  weights: Weights = DEFAULT_WEIGHTS
): RecommendSet {
  // 拆分前后区
  const frontStats = stats.filter(
    (s) => s.number >= FRONT_RANGE.min && s.number <= FRONT_RANGE.max
  );
  const backStats = stats.filter(
    (s) => s.number >= BACK_RANGE.min && s.number <= BACK_RANGE.max
  );

  const front = pickBalanced(frontStats, FRONT_RANGE.count, weights, FRONT_ZONES);
  const back = pickBalanced(backStats, BACK_RANGE.count, weights, BACK_ZONES);

  const totalScore =
    avg(front.map((n) => scoreNumber(n, weights))) +
    avg(back.map((n) => scoreNumber(n, weights)));

  return {
    id: uuid(),
    front: front.map((s) => s.number).sort((a, b) => a - b),
    back: back.map((s) => s.number).sort((a, b) => a - b),
    score: Number(totalScore.toFixed(3)),
    createdAt: Date.now(),
    reason: '基于热度、遗漏与区间均衡综合推荐',
  };
}

// 区间均衡抽样
function pickBalanced(
  stats: NumberStat[],
  count: number,
  weights: Weights,
  zones: number[][]
): NumberStat[] {
  // 按分数排序
  const scored = stats
    .map((s) => ({ s, score: scoreNumber(s, weights) }))
    .sort((a, b) => b.score - a.score);

  // 每个区间至少保证一定占比
  const zoneCount = zones.length;
  const perZone = Math.max(1, Math.floor(count / zoneCount));

  const picked: NumberStat[] = [];
  const used = new Set<number>();

  // 先按区间各取 perZone
  for (let z = 0; z < zoneCount && picked.length < count; z++) {
    const candidates = scored.filter(
      (x) => x.s.zoneIndex === z && !used.has(x.s.number)
    );
    for (const c of candidates) {
      if (picked.filter((p) => p.zoneIndex === z).length >= perZone) break;
      picked.push(c.s);
      used.add(c.s.number);
      if (picked.length >= count) break;
    }
  }

  // 不够再补
  if (picked.length < count) {
    for (const c of scored) {
      if (used.has(c.s.number)) continue;
      picked.push(c.s);
      used.add(c.s.number);
      if (picked.length >= count) break;
    }
  }

  // 随机微洗牌，避免顺序偏差
  return shuffle(picked).slice(0, count);
}