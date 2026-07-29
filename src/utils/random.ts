export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 加权抽取（无放回，返回索引数组）
export function weightedPick<T>(items: T[], weights: number[], count: number): T[] {
  if (items.length !== weights.length) throw new Error('length mismatch');
  const picked: T[] = [];
  const pool = items.map((v, i) => ({ v, w: weights[i] }));
  for (let k = 0; k < count && pool.length > 0; k++) {
    const total = pool.reduce((a, b) => a + Math.max(0, b.w), 0);
    if (total <= 0) break;
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= Math.max(0, pool[i].w);
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    picked.push(pool[idx].v);
    pool.splice(idx, 1);
  }
  return picked;
}