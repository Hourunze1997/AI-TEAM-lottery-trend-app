import { create } from 'zustand';
import { FavoriteSet } from '../models/types';
import { STORAGE_KEYS } from '../utils/constants';
import { saveItem, loadItem } from '../services/storageService';

interface FavoriteState {
  favorites: FavoriteSet[];
  hydrate: () => Promise<void>;
  add: (f: FavoriteSet) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleNotify: (id: string) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],

  hydrate: async () => {
    const cached = await loadItem<FavoriteSet[]>(STORAGE_KEYS.FAVORITES);
    if (cached) set({ favorites: cached });
  },

  add: async (f: FavoriteSet) => {
    const next = [f, ...get().favorites];
    set({ favorites: next });
    await saveItem(STORAGE_KEYS.FAVORITES, next);
  },

  remove: async (id: string) => {
    const next = get().favorites.filter((x) => x.id !== id);
    set({ favorites: next });
    await saveItem(STORAGE_KEYS.FAVORITES, next);
  },

  toggleNotify: async (id: string) => {
    const next = get().favorites.map((x) =>
      x.id === id ? { ...x, notify: !x.notify } : x
    );
    set({ favorites: next });
    await saveItem(STORAGE_KEYS.FAVORITES, next);
  },
}));