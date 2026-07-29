// 历史开奖 API
// 主路径: 公开数据源 (yangxb919/lottery-data, GitHub raw)
// 可选: 用户在 Settings 配置了后端 URL 时优先用本地后端
import { http } from './client';
import { PageResult } from '../models/types';
import { DrawRecord } from '../types/models';
import {
  loadAllDraws,
  refreshFromRemote,
  getCachedMeta,
  DataSourceMeta,
  PUBLIC_LOTTERY_DATA_URL,
} from '../services/publicData';
import { loadItem, saveItem } from '../services/storageService';

const BACKEND_OVERRIDE_KEY = '@lottery/api_base_url';
const PAGE_SIZE = 20;

// 客户端内存池（启动时填充）
let POOL: DrawRecord[] = [];
let META: DataSourceMeta | null = null;
let LOADING: Promise<void> | null = null;

async function ensureLoaded(force = false): Promise<void> {
  if (force) {
    LOADING = (async () => {
      try {
        const r = await refreshFromRemote(200);
        POOL = r.items;
        META = r.meta;
      } catch (e) {
        // refresh 失败则用本地
        const r = await loadAllDraws(200);
        POOL = r.items;
        META = r.meta;
      }
    })();
    return LOADING;
  }
  if (POOL.length) return;
  if (LOADING) return LOADING;
  LOADING = (async () => {
    const r = await loadAllDraws(200);
    POOL = r.items;
    META = r.meta;
    await saveItem('@lottery/pool_v1', POOL);
  })();
  return LOADING;
}

export async function getCurrentDataSource(): Promise<DataSourceMeta> {
  await ensureLoaded();
  if (META) return META;
  return {
    source: 'seed',
    fetchedAt: new Date(0).toISOString(),
    count: 0,
  };
}

export const DATA_SOURCE_URL = PUBLIC_LOTTERY_DATA_URL;

// 过滤 + 分页
function pageOf(pool: DrawRecord[], page: number, pageSize: number, keyword?: string): PageResult<DrawRecord> {
  let list = pool;
  if (keyword && keyword.trim()) {
    const k = keyword.trim();
    list = pool.filter((d) => d.period.includes(k));
  }
  const total = list.length;
  const start = (page - 1) * pageSize;
  const slice = list.slice(start, start + pageSize);
  return {
    list: slice,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

/**
 * 分页获取历史开奖
 */
export async function fetchHistory(
  page: number,
  pageSize: number,
  keyword?: string,
): Promise<PageResult<DrawRecord>> {
  // 如果用户在 Settings 配置了后端，优先走后端
  const override = await loadItem<string>(BACKEND_OVERRIDE_KEY);
  if (override && override.trim()) {
    try {
      const data = await http.get<PageResult<DrawRecord>>('/api/v1/draws', {
        params: { page, page_size: pageSize, keyword },
      });
      return { list: data.list, page, pageSize, hasMore: data.hasMore };
    } catch (e) {
      console.warn('[fetchHistory] backend failed, fallback to publicData', e);
      // 失败回落到公开数据
    }
  }
  await ensureLoaded();
  return pageOf(POOL, page, pageSize, keyword);
}

/**
 * 获取最新一期
 */
export async function fetchLatest(): Promise<DrawRecord | null> {
  const override = await loadItem<string>(BACKEND_OVERRIDE_KEY);
  if (override && override.trim()) {
    try {
      const r = await http.get<DrawRecord>('/api/v1/draws/latest');
      return r;
    } catch (e) {
      console.warn('[fetchLatest] backend failed, fallback to publicData', e);
    }
  }
  await ensureLoaded();
  return POOL[0] || null;
}

/**
 * 按期号查询
 */
export async function fetchByPeriod(period: string): Promise<DrawRecord | null> {
  const override = await loadItem<string>(BACKEND_OVERRIDE_KEY);
  if (override && override.trim()) {
    try {
      const r = await http.get<DrawRecord>(`/api/v1/draws/${period}`);
      return r;
    } catch (e) {
      console.warn('[fetchByPeriod] backend failed, fallback', e);
    }
  }
  await ensureLoaded();
  return POOL.find((d) => d.period === period) || null;
}

/**
 * 手动刷新数据
 */
export async function refreshData(): Promise<DataSourceMeta> {
  const override = await loadItem<string>(BACKEND_OVERRIDE_KEY);
  if (override && override.trim()) {
    // 后端模式：触发一次 fetchLatest 让缓存更新
    await fetchLatest();
    return {
      source: 'remote',
      fetchedAt: new Date().toISOString(),
      count: -1,
      url: override,
    };
  }
  await ensureLoaded(true);
  return META!;
}