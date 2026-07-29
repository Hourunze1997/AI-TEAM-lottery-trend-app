import { http } from './client';
import { LotteryDraw, PageResult } from '../models/types';

// 分页获取历史开奖
export async function fetchHistory(
  page: number,
  pageSize: number
): Promise<PageResult<LotteryDraw>> {
  try {
    const data = await http.get<PageResult<LotteryDraw>>('/lottery/history', {
      params: { page, pageSize },
    });
    return data;
  } catch (e) {
    // 接口失败时返回空数据，避免阻塞 UI
    // eslint-disable-next-line no-console
    console.warn('[fetchHistory] failed, return empty', e);
    return { list: [], page, pageSize, hasMore: false };
  }
}

// 获取最新一期
export async function fetchLatest(): Promise<LotteryDraw | null> {
  try {
    const data = await http.get<LotteryDraw>('/lottery/latest');
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[fetchLatest] failed', e);
    return null;
  }
}