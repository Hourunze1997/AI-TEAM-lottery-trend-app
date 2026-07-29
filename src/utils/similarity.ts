import { DrawRecord } from '../types/models';

// Jaccard 相似度 0-100
export function calcSimilarity(
  a: { front: number[]; back: number[] },
  b: DrawRecord,
): number {
  const setA = new Set([...a.front.map((n) => `f${n}`), ...a.back.map((n) => `b${n}`)]);
  const setB = new Set([...b.front.map((n) => `f${n}`), ...b.back.map((n) => `b${n}`)]);
  let inter = 0;
  setA.forEach((v) => {
    if (setB.has(v)) inter++;
  });
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return Math.round((inter / union) * 100);
}