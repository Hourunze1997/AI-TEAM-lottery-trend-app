// 随机选号服务 —— 纯随机 + 透明观感规则。
// 诚实边界：开奖完全随机，任何选号方式（包括本服务）都不改变中奖概率；
// 观感规则（连号上限/和值范围）只影响号码"看着顺不顺眼"，不影响期望回报。
// 历史上四种"推荐算法"已被 2821 期真实开奖回测证实与纯随机无法区分，故移除。
import { FRONT_RANGE, BACK_RANGE } from '../utils/constants';
import { sum, uuid } from '../utils/helpers';

export interface PickerOptions {
  maxConsecutive?: number;      // 前区最长连号上限（观感规则）
  sumRange?: [number, number];  // 前区和值范围（观感规则）
}

export interface PickerTicket {
  id: string;
  front: number[];   // 5 个前区号，升序
  back: number[];    // 2 个后区号，升序
  createdAt: number;
}

export const DISCLAIMER =
  '开奖完全随机，选号工具不提升中奖概率；彩票长期返奖率约 50%，请理性投注。';

// 最长连续号段长度，如 [3,4,5,9,12] → 3
export function maxRun(nums: number[]): number {
  let best = 1;
  let run = 1;
  for (let i = 1; i < nums.length; i++) {
    run = nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

function pickN(min: number, max: number, n: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out.sort((a, b) => a - b);
}

export function generateTicket(opts: PickerOptions = {}): PickerTicket {
  // 拒绝采样满足观感规则；规则过严时抛错而不是静默放宽
  for (let attempt = 0; attempt < 1000; attempt++) {
    const front = pickN(FRONT_RANGE.min, FRONT_RANGE.max, FRONT_RANGE.count);
    if (opts.maxConsecutive != null && maxRun(front) > opts.maxConsecutive) continue;
    if (
      opts.sumRange &&
      (sum(front) < opts.sumRange[0] || sum(front) > opts.sumRange[1])
    ) {
      continue;
    }
    return {
      id: uuid(),
      front,
      back: pickN(BACK_RANGE.min, BACK_RANGE.max, BACK_RANGE.count),
      createdAt: Date.now(),
    };
  }
  throw new Error('观感规则过严，无法生成号码，请放宽条件');
}

export function generateTickets(count: number, opts: PickerOptions = {}): PickerTicket[] {
  return Array.from({ length: count }, () => generateTicket(opts));
}
