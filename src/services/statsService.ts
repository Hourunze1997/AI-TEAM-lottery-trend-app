import { LotteryDraw, NumberStat } from '../models/types';
import { FRONT_RANGE, BACK_RANGE, FRONT_ZONES } from '../utils/constants';

// 统计每个号码出现次数
export function calcFrequency(draws: LotteryDraw[]): Record<number, number> {
  const freq: Record<number, number> = {};
  for (const d of draws) {
    for (const n of d.front) freq[n] = (freq[n] || 0) + 1;
    for (const n of d.back) freq[n] = (freq[n] || 0) + 1;
  }
  return freq;
}

// 计算当前遗漏期数（自最后一次出现到最新一期）
export function calcMissing(draws: LotteryDraw[]): Record<number, number> {
  const missing: Record<number, number> = {};
  if (draws.length === 0) return missing;
  // 假设数组按时间倒序，第一个最新
  const latest = draws[0];
  const allNums = new Set<number>();
  for (const d of draws) {
    d.front.forEach((n) => allNums.add(n));
    d.back.forEach((n) => allNums.add(n));
  }
  for (const n of allNums) {
    let miss = 0;
    for (const d of draws) {
      if (d.front.includes(n) || d.back.includes(n)) break;
      miss++;
    }
    missing[n] = miss;
  }
  return missing;
}

// 奇偶比
export function calcOddEven(nums: number[]): { odd: number; even: number } {
  let odd = 0;
  let even = 0;
  for (const n of nums) {
    if (n % 2 === 0) even++;
    else odd++;
  }
  return { odd, even };
}

// 区间比
export function calcZoneRatio(nums: number[], zones: number[][]): number[] {
  const result = new Array(zones.length).fill(0);
  for (const n of nums) {
    for (let i = 0; i < zones.length; i++) {
      const [min, max] = zones[i];
      if (n >= min && n <= max) {
        result[i]++;
        break;
      }
    }
  }
  return result;
}

// 计算所属区间
function getZoneIndex(n: number, zones: number[][]): number {
  for (let i = 0; i < zones.length; i++) {
    const [min, max] = zones[i];
    if (n >= min && n <= max) return i;
  }
  return 0;
}

// 组装 NumberStat 列表
export function buildStatList(draws: LotteryDraw[]): NumberStat[] {
  const freq = calcFrequency(draws);
  const missing = calcMissing(draws);

  // 构造前区 + 后区号码池
  const allNums: number[] = [];
  for (let i = FRONT_RANGE.min; i <= FRONT_RANGE.max; i++) allNums.push(i);
  for (let i = BACK_RANGE.min; i <= BACK_RANGE.max; i++) allNums.push(i);

  // 计算平均遗漏
  const missingHistory: Record<number, number[]> = {};
  for (const n of allNums) {
    let run = 0;
    const list: number[] = [];
    for (const d of draws) {
      if (d.front.includes(n) || d.back.includes(n)) {
        list.push(run);
        run = 0;
      } else {
        run++;
      }
    }
    if (run > 0) list.push(run);
    missingHistory[n] = list;
  }

  // 阈值：频次 > 均值即热号
  const freqValues = allNums.map((n) => freq[n] || 0);
  const avgFreq =
    freqValues.reduce((a, b) => a + b, 0) / (freqValues.length || 1);

  return allNums.map((n) => {
    const mList = missingHistory[n] || [0];
    const avgMissing = mList.reduce((a, b) => a + b, 0) / (mList.length || 1);
    return {
      number: n,
      frequency: freq[n] || 0,
      missing: missing[n] ?? 0,
      avgMissing: Number.isFinite(avgMissing) ? avgMissing : 0,
      hot: (freq[n] || 0) >= avgFreq,
      zoneIndex: getZoneIndex(n, FRONT_ZONES),
    };
  });
}