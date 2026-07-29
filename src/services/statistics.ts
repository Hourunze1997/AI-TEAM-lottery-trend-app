import { DrawRecord, NumberStat } from '../types/models';
import { LOTTERY } from '../constants/lottery';

export function calcNumberStats(records: DrawRecord[]): NumberStat[] {
  const result: NumberStat[] = [];

  // 前区
  for (let n = LOTTERY.FRONT_MIN; n <= LOTTERY.FRONT_MAX; n++) {
    const appearances: number[] = [];
    records.forEach((r, idx) => {
      if (r.front.includes(n)) appearances.push(idx);
    });
    const miss = appearances.length === 0 ? records.length : appearances[0];
    const gaps: number[] = [];
    for (let i = 1; i < appearances.length; i++) {
      gaps.push(appearances[i - 1] - appearances[i]);
    }
    const avgMiss = gaps.length === 0 ? records.length : gaps.reduce((a, b) => a + b, 0) / gaps.length;
    result.push({
      number: n,
      area: 'front',
      count: appearances.length,
      miss,
      avgMiss,
      rank: 0,
    });
  }

  // 后区
  for (let n = LOTTERY.BACK_MIN; n <= LOTTERY.BACK_MAX; n++) {
    const appearances: number[] = [];
    records.forEach((r, idx) => {
      if (r.back.includes(n)) appearances.push(idx);
    });
    const miss = appearances.length === 0 ? records.length : appearances[0];
    const gaps: number[] = [];
    for (let i = 1; i < appearances.length; i++) {
      gaps.push(appearances[i - 1] - appearances[i]);
    }
    const avgMiss = gaps.length === 0 ? records.length : gaps.reduce((a, b) => a + b, 0) / gaps.length;
    result.push({
      number: n,
      area: 'back',
      count: appearances.length,
      miss,
      avgMiss,
      rank: 0,
    });
  }

  // 计算排名（按出现次数降序）
  const sorted = [...result].sort((a, b) => b.count - a.count);
  sorted.forEach((s, i) => {
    const target = result.find((r) => r.number === s.number && r.area === s.area);
    if (target) target.rank = i + 1;
  });

  return result;
}

export function calcFrontHot(stats: NumberStat[], topN: number): NumberStat[] {
  return stats
    .filter((s) => s.area === 'front')
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function calcBackCold(stats: NumberStat[], topN: number): NumberStat[] {
  return stats
    .filter((s) => s.area === 'back')
    .sort((a, b) => b.miss - a.miss)
    .slice(0, topN);
}

export function calcTrend(
  records: DrawRecord[],
  n: number,
): { period: string; fronts: number[]; backs: number[] }[] {
  return records.slice(0, n).map((r) => ({
    period: r.period,
    fronts: r.front,
    backs: r.back,
  }));
}

export function rangeDistribution(records: DrawRecord[]): { name: string; population: number }[] {
  // 前区三段: 1-12, 13-24, 25-35
  let a = 0, b = 0, c = 0;
  records.forEach((r) => {
    r.front.forEach((num) => {
      if (num <= 12) a++;
      else if (num <= 24) b++;
      else c++;
    });
  });
  return [
    { name: '一区(1-12)', population: a },
    { name: '二区(13-24)', population: b },
    { name: '三区(25-35)', population: c },
  ];
}