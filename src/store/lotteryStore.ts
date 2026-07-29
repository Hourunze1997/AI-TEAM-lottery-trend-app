import { create } from 'zustand';
import { LotteryDraw } from '../models/types';
import { fetchHistory, fetchLatest } from '../api/lottery';
import { STORAGE_KEYS } from '../utils/constants';
import { saveItem, loadItem } from '../services/storageService';

interface LotteryState {
  history: LotteryDraw[];
  latest: LotteryDraw | null;
  loading: boolean;
  hasMore: boolean;
  page: number;
  loadHistory: () => Promise<void>;
  loadLatest: () => Promise<void>;
  setLatest: (d: LotteryDraw) => void;
  hydrate: () => Promise<void>;
}

const PAGE_SIZE = 20;

export const useLotteryStore = create<LotteryState>((set, get) => ({
  history: [],
  latest: null,
  loading: false,
  hasMore: true,
  page: 0,

  hydrate: async () => {
    const cached = await loadItem<LotteryDraw[]>(STORAGE_KEYS.HISTORY);
    if (cached && cached.length) {
      set({ history: cached });
    }
    const latestCached = await loadItem<LotteryDraw>(STORAGE_KEYS.LASTEST);
    if (latestCached) set({ latest: latestCached });
  },

  loadHistory: async () => {
    const { loading, hasMore, page } = get();
    if (loading || !hasMore) return;
    set({ loading: true });
    try {
      const next = page + 1;
      const result = await fetchHistory(next, PAGE_SIZE);
      const newList =
        next === 1 ? result.list : [...get().history, ...result.list];
      set({
        history: newList,
        loading: false,
        hasMore: result.hasMore,
        page: next,
      });
      await saveItem(STORAGE_KEYS.HISTORY, newList.slice(0, 100));
    } catch (e) {
      set({ loading: false });
    }
  },

  loadLatest: async () => {
    const d = await fetchLatest();
    if (d) {
      set({ latest: d });
      await saveItem(STORAGE_KEYS.LASTEST, d);
    }
  },

  setLatest: (d: LotteryDraw) => {
    set({ latest: d });
    saveItem(STORAGE_KEYS.LASTEST, d).catch(() => undefined);
  },
}));