import { useCallback, useEffect, useState } from 'react';
import { DrawRecord } from '../types/models';
import { fetchHistory, fetchByPeriod } from '../api/lottery';

const PAGE_SIZE = 20;

export function useHistoryList() {
  const [data, setData] = useState<DrawRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(async (p: number, append: boolean) => {
    if (loading) return;
    setLoading(true);
    try {
      const list = await fetchHistory(p, PAGE_SIZE);
      if (append) {
        setData((prev) => [...prev, ...list]);
      } else {
        setData(list);
      }
      setHasMore(list.length === PAGE_SIZE);
    } catch (e) {
      console.warn('[useHistoryList]', e);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadPage(1, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setPage(1);
    loadPage(1, false);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    loadPage(next, true);
  }, [hasMore, loading, page, loadPage]);

  const search = useCallback(async (period: string) => {
    if (!period.trim()) {
      refresh();
      return;
    }
    setLoading(true);
    try {
      const found = await fetchByPeriod(period.trim());
      setData(found ? [found] : []);
      setHasMore(false);
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return { data, loading, refresh, loadMore, search, hasMore };
}