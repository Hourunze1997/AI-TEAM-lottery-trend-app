// 通用工具函数

export function formatDate(input: string | number | Date, fmt = 'YYYY-MM-DD HH:mm'): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return fmt
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()));
}

// 洗牌（Fisher-Yates）
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 范围数组
export function range(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i++) out.push(i);
  return out;
}

// 数组求和
export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

// 数组均值
export function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

// 排序后取 TopN
export function topN<T>(arr: T[], n: number, score: (item: T) => number): T[] {
  return arr
    .map((item) => ({ item, s: score(item) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.item);
}

// 生成 UUID
export function uuid(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}