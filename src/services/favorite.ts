import { Favorite, DrawRecord, MatchResult } from '../types/models';
import { getItem, setItem } from './storage';
import { calcSimilarity } from '../utils/similarity';

const KEY = 'favorites';

function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export async function addFavorite(
  fav: Omit<Favorite, 'favId' | 'createdAt' | 'matchedHistory'>,
): Promise<Favorite> {
  const list = (await getItem<Favorite[]>(KEY)) ?? [];
  const item: Favorite = {
    ...fav,
    favId: uuid(),
    createdAt: new Date().toISOString(),
    matchedHistory: [],
  };
  list.unshift(item);
  await setItem(KEY, list);
  return item;
}

export async function removeFavorite(favId: string): Promise<void> {
  const list = (await getItem<Favorite[]>(KEY)) ?? [];
  const next = list.filter((f) => f.favId !== favId);
  await setItem(KEY, next);
}

export async function listFavorites(): Promise<Favorite[]> {
  return (await getItem<Favorite[]>(KEY)) ?? [];
}

export async function updateFavorites(list: Favorite[]): Promise<void> {
  await setItem(KEY, list);
}

export function matchHistory(fav: Favorite, records: DrawRecord[]): MatchResult[] {
  const results: MatchResult[] = [];
  records.forEach((r) => {
    const frontHit = fav.front.filter((n) => r.front.includes(n)).length;
    const backHit = fav.back.filter((n) => r.back.includes(n)).length;
    if (frontHit > 0 || backHit > 0) {
      results.push({
        period: r.period,
        drawDate: r.drawDate,
        frontHit,
        backHit,
      });
    }
  });
  return results;
}

export { calcSimilarity };