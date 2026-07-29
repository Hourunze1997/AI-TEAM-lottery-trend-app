import React, { createContext, useContext, useMemo } from 'react';
import { Favorite, DrawRecord, Reminder } from '../types/models';
import { useFavorites } from '../hooks/useFavorites';
import { fetchLatest } from '../api/lottery';
import { getReminder } from '../services/notification';

interface AppContextValue {
  favorites: Favorite[];
  addFavorite: (fav: Omit<Favorite, 'favId' | 'createdAt' | 'matchedHistory'>) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  latestDraw: DrawRecord | null;
  refreshLatest: () => Promise<void>;
  reminder: Reminder | null;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { items, add, remove, refresh } = useFavorites();

  const [latestDraw, setLatestDraw] = React.useState<DrawRecord | null>(null);
  const [reminder, setReminder] = React.useState<Reminder | null>(null);

  const refreshLatest = React.useCallback(async () => {
    try {
      const d = await fetchLatest();
      setLatestDraw(d);
    } catch (e) {
      console.warn('[refreshLatest]', e);
    }
  }, []);

  React.useEffect(() => {
    refreshLatest();
    getReminder().then(setReminder).catch(() => {});
  }, [refreshLatest]);

  const value = useMemo<AppContextValue>(
    () => ({
      favorites: items,
      addFavorite: add,
      removeFavorite: remove,
      refreshFavorites: refresh,
      latestDraw,
      refreshLatest,
      reminder,
    }),
    [items, add, remove, refresh, latestDraw, refreshLatest, reminder],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}