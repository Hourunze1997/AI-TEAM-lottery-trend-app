import { DrawRecord, Recommendation, NumberStat } from '../types/models';
import { LOTTERY } from '../constants/lottery';
import { calcNumberStats } from './statistics';
import { unique } from '../utils/array';

// 通用：按权重取N个不重复号码
function pickByScore(
  pool: { number: number; score: number }[],
  count: number,
  range: { min: number; max: number },
): number[] {
  const sorted = [...pool].sort((a, b) => b.score - a.score);
  const picked: number[] = [];
  for (const item of sorted) {
    if (item.number < range.min || item.number > range.max) continue;
    if (picked.includes(item.number)) continue;
    picked.push(item.number);
    if (picked.length >= count) break;
  }
  // 不足时随机补足
  while (picked.length < count) {
    const n = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    if (!picked.includes(n)) picked.push(n);
  }
  return picked.sort((a, b) => a - b);
}

export function recommendByFrequency(records: DrawRecord[]): Recommendation {
  const stats = calcNumberStats(records);
  const frontPool = stats
    .filter((s) => s.area === 'front')
    .map((s) => ({ number: s.number, score: s.count }));
  const backPool = stats
    .filter((s) => s.area === 'back')
    .map((s) => ({ number: s.number, score: s.count }));

  const front = pickByScore(frontPool, LOTTERY.FRONT_COUNT, { min: LOTTERY.FRONT_MIN, max: LOTTERY.FRONT_MAX });
  const back = pickByScore(backPool, LOTTERY.BACK_COUNT, { min: LOTTERY.BACK_MIN, max: LOTTERY.BACK_MAX });

  return {
    algorithm: 'frequency',
    front,
    back,
    confidence: 60,
    reason: '基于历史出现频率推荐，出现次数越多权重越高',
    generatedAt: new Date().toISOString(),
  };
}

export function recommendByMiss(records: DrawRecord[]): Recommendation {
  const stats = calcNumberStats(records);
  // 遗漏越久越可能"回补"
  const frontPool = stats
    .filter((s) => s.area === 'front')
    .map((s) => ({ number: s.number, score: s.miss }));
  const backPool = stats
    .filter((s) => s.area === 'back')
    .map((s) => ({ number: s.number, score: s.miss }));

  const front = pickByScore(frontPool, LOTTERY.FRONT_COUNT, { min: LOTTERY.FRONT_MIN, max: LOTTERY.FRONT_MAX });
  const back = pickByScore(backPool, LOTTERY.BACK_COUNT, { min: LOTTERY.BACK_MIN, max: LOTTERY.BACK_MAX });

  return {
    algorithm: 'miss',
    front,
    back,
    confidence: 55,
    reason: '基于遗漏值回补理论，长期未出的号码更有可能出现',
    generatedAt: new Date().toISOString(),
  };
}

export function recommendByWeighted(records: DrawRecord[]): Recommendation {
  if (records.length === 0) {
    return recommendByFrequency(records);
  }
  // 近期权重更高: weight = exp(-i/30)
  const weights = records.map((_, i) => Math.exp(-i / 30));

  const frontScore = new Map<number, number>();
  const backScore = new Map<number, number>();
  for (let n = LOTTERY.FRONT_MIN; n <= LOTTERY.FRONT_MAX; n++) frontScore.set(n, 0);
  for (let n = LOTTERY.BACK_MIN; n <= LOTTERY.BACK_MAX; n++) backScore.set(n, 0);

  records.forEach((r, i) => {
    const w = weights[i];
    r.front.forEach((n) => frontScore.set(n, (frontScore.get(n) ?? 0) + w));
    r.back.forEach((n) => backScore.set(n, (backScore.get(n) ?? 0) + w));
  });

  const frontPool = Array.from(frontScore.entries()).map(([number, score]) => ({ number, score }));
  const backPool = Array.from(backScore.entries()).map(([number, score]) => ({ number, score }));

  const front = pickByScore(frontPool, LOTTERY.FRONT_COUNT, { min: LOTTERY.FRONT_MIN, max: LOTTERY.FRONT_MAX });
  const back = pickByScore(backPool, LOTTERY.BACK_COUNT, { min: LOTTERY.BACK_MIN, max: LOTTERY.BACK_MAX });

  return {
    algorithm: 'weighted',
    front,
    back,
    confidence: 65,
    reason: '近期数据加权，距离当前越近权重越高',
    generatedAt: new Date().toISOString(),
  };
}

export function recommendHybrid(records: DrawRecord[]): Recommendation {
  const stats = calcNumberStats(records);
  const frontHits = new Set<number>();
  const backHits = new Set<number>();

  // 综合三种结果取并集，按命中次数计分
  const f1 = recommendByFrequency(records).front;
  const f2 = recommendByMiss(records).front;
  const f3 = recommendByWeighted(records).front;
  const b1 = recommendByFrequency(records).back;
  const b2 = recommendByMiss(records).back;
  const b3 = recommendByWeighted(records).back;

  [...f1, ...f2, ...f3].forEach((n) => frontHits.add(n));
  [...b1, ...b2, ...b3].forEach((n) => backHits.add(n));

  const frontCount: Record<number, number> = {};
  const backCount: Record<number, number> = {};
  [f1, f2, f3].forEach((arr) => arr.forEach((n) => (frontCount[n] = (frontCount[n] ?? 0) + 1)));
  [b1, b2, b3].forEach((arr) => arr.forEach((n) => (backCount[n] = (backCount[n] ?? 0) + 1)));

  const frontPool = Array.from(frontHits).map((number) => ({ number, score: frontCount[number] ?? 0 }));
  const backPool = Array.from(backHits).map((number) => ({ number, score: backCount[number] ?? 0 }));

  const front = pickByScore(frontPool, LOTTERY.FRONT_COUNT, { min: LOTTERY.FRONT_MIN, max: LOTTERY.FRONT_MAX });
  const back = pickByScore(backPool, LOTTERY.BACK_COUNT, { min: LOTTERY.BACK_MIN, max: LOTTERY.BACK_MAX });

  // 计算置信度
  const frontHot = stats.filter((s) => s.area === 'front').sort((a, b) => b.count - a.count).slice(0, 10);
  const backCold = stats.filter((s) => s.area === 'back').sort((a, b) => b.miss - a.miss).slice(0, 5);
  const hotSet = new Set(frontHot.map((s: NumberStat) => s.number));
  const coldSet = new Set(backCold.map((s: NumberStat) => s.number));
  const hotHit = front.filter((n) => hotSet.has(n)).length;
  const coldHit = back.filter((n) => coldSet.has(n)).length;

  const missValues = stats.filter((s) => s.area === 'front').map((s) => s.miss);
  const mean = missValues.reduce((a, b) => a + b, 0) / missValues.length;
  const variance = missValues.reduce((a, b) => a + (b - mean) ** 2, 0) / missValues.length;

  let confidence = 50 + hotHit * 8 + coldHit * 5 + (1 / (1 + variance)) * 20;
  confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  return {
    algorithm: 'hybrid',
    front: unique(front).sort((a, b) => a - b),
    back: unique(back).sort((a, b) => a - b),
    confidence,
    reason: '融合频率/遗漏/加权三种算法，综合评分',
    generatedAt: new Date().toISOString(),
  };
}