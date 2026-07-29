import { useCallback, useEffect, useState } from 'react';
import { DrawRecord } from '../types/models';
import { fetchHistory, fetchByPeriod } from '../api/lottery';

const PAGE_SIZE = 20;

export function useHistoryList() {
  const [data, setData] = useState<DrawRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [keyword, setKeywordState] = useState('');

  const loadPage = useCallback(
    async (p: number, append: boolean, kw: string) => {
      if (loading) return;
      setLoading(true);
      try {
        const result = await fetchHistory(p, PAGE_SIZE, kw);
        if (append) {
          setData((prev) => [...prev, ...result.list]);
        } else {
          setData(result.list);
        }
        setHasMore(result.hasMore);
      } catch (e) {
        console.warn('[useHistoryList]', e);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  useEffect(() => {
    loadPage(1, false, '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setPage(1);
    loadPage(1, false, keyword);
  }, [loadPage, keyword]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    loadPage(next, true, keyword);
  }, [hasMore, loading, page, loadPage, keyword]);

  const search = useCallback(
    async (period: string) => {
      setKeywordState(period);
      if (!period.trim()) {
        await loadPage(1, false, '');
        setPage(1);
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
    },
    [loadPage],
  );

  return { data, loading, refresh, loadMore, search, hasMore };
}