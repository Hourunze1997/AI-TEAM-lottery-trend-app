import { useCallback, useEffect, useState } from 'react';
import { Favorite, DrawRecord } from '../types/models';
import { listFavorites, addFavorite, removeFavorite, updateFavorites, matchHistory } from '../services/favorite';
import { getAllMockData } from '../api/lottery';

export function useFavorites() {
  const [items, setItems] = useState<Favorite[]>([]);

  const refresh = useCallback(async () => {
    const list = await listFavorites();
    const records = getAllMockData();
    const enriched = list.map((f) => ({ ...f, matchedHistory: matchHistory(f, records) }));
    setItems(enriched);
    await updateFavorites(enriched);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (fav: Omit<Favorite, 'favId' | 'createdAt' | 'matchedHistory'>) => {
      await addFavorite(fav);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await removeFavorite(id);
      await refresh();
    },
    [refresh],
  );

  return { items, add, remove, refresh };
}