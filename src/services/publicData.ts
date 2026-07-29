// 公开数据源服务
// 数据来自 yangxb919/lottery-data (GitHub 开源项目, 来源 500.com)
// 优先级: GitHub raw → AsyncStorage 缓存 → assets 内置种子
import axios from 'axios';
import { DrawRecord } from '../types/models';
import { saveItem, loadItem } from './storageService';

// 公开 JSON 数据源
// raw.githubusercontent.com 直连，GitHub 公开资源
export const PUBLIC_LOTTERY_DATA_URL =
  'https://raw.githubusercontent.com/yangxb919/lottery-data/main/data/dlt.json';

// AsyncStorage 缓存键
const CACHE_KEY = '@lottery/dlt_cache_v1';
const CACHE_META_KEY = '@lottery/dlt_meta_v1';

interface RawDraw {
  issue: string;
  date: string;
  front: string[];
  back: string[];
  source?: string;
}

export interface DataSourceMeta {
  source: 'remote' | 'cache' | 'seed';
  fetchedAt: string; // ISO
  count: number;
  url?: string;
}

/**
 * 计算星期几 (1-7, 周一=1)
 */
function weekdayOf(dateISO: string): number {
  const d = new Date(dateISO);
  const dow = d.getDay(); // 0=Sun..6=Sat
  return dow === 0 ? 7 : dow;
}

/**
 * raw → DrawRecord
 */
export function mapDraw(raw: RawDraw): DrawRecord {
  return {
    period: raw.issue,
    drawDate: raw.date,
    weekday: weekdayOf(raw.date),
    front: raw.front.map((n) => parseInt(n, 10)),
    back: raw.back.map((n) => parseInt(n, 10)),
  };
}

/**
 * 主入口：拉取全部历史（最多 maxCount 条），三级兜底
 */
export async function loadAllDraws(
  maxCount = 200,
): Promise<{ items: DrawRecord[]; meta: DataSourceMeta }> {
  // 1. 尝试 GitHub raw
  try {
    const items = await fetchRemote(maxCount);
    if (items.length) {
      await saveItem(CACHE_KEY, items);
      await saveItem(CACHE_META_KEY, {
        source: 'remote',
        fetchedAt: new Date().toISOString(),
        count: items.length,
        url: PUBLIC_LOTTERY_DATA_URL,
      });
      return {
        items,
        meta: {
          source: 'remote',
          fetchedAt: new Date().toISOString(),
          count: items.length,
          url: PUBLIC_LOTTERY_DATA_URL,
        },
      };
    }
  } catch (e) {
    console.warn('[publicData] remote failed', e);
  }

  // 2. 退化到 AsyncStorage 缓存
  try {
    const cached = await loadItem<DrawRecord[]>(CACHE_KEY);
    if (cached && cached.length) {
      return {
        items: cached.slice(0, maxCount),
        meta: {
          source: 'cache',
          fetchedAt: new Date().toISOString(),
          count: cached.length,
        },
      };
    }
  } catch (e) {
    console.warn('[publicData] cache read failed', e);
  }

  // 3. 最后退化到打包内置种子 (assets/dlt_seed.json)
  const items = await loadBundledSeed(maxCount);
  return {
    items,
    meta: {
      source: 'seed',
      fetchedAt: new Date().toISOString(),
      count: items.length,
    },
  };
}

/**
 * 强制从远端刷新（用户手动触发）
 */
export async function refreshFromRemote(
  maxCount = 200,
): Promise<{ items: DrawRecord[]; meta: DataSourceMeta }> {
  const items = await fetchRemote(maxCount);
  if (!items.length) throw new Error('远端返回空数据');
  await saveItem(CACHE_KEY, items);
  await saveItem(CACHE_META_KEY, {
    source: 'remote',
    fetchedAt: new Date().toISOString(),
    count: items.length,
    url: PUBLIC_LOTTERY_DATA_URL,
  });
  return {
    items,
    meta: {
      source: 'remote',
      fetchedAt: new Date().toISOString(),
      count: items.length,
      url: PUBLIC_LOTTERY_DATA_URL,
    },
  };
}

export async function getCachedMeta(): Promise<DataSourceMeta | null> {
  return loadItem<DataSourceMeta>(CACHE_META_KEY);
}

/* ---------- 内部 ---------- */

async function fetchRemote(maxCount: number): Promise<DrawRecord[]> {
  const resp = await axios.get<RawDraw[]>(PUBLIC_LOTTERY_DATA_URL, {
    timeout: 15000,
  });
  const arr = Array.isArray(resp.data) ? resp.data : [];
  return arr.slice(0, maxCount).map(mapDraw);
}

async function loadBundledSeed(maxCount: number): Promise<DrawRecord[]> {
  try {
    // require 保证在打包阶段被包含
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seed = require('../../assets/dlt_seed.json') as RawDraw[];
    if (!Array.isArray(seed)) return [];
    return seed.slice(0, maxCount).map(mapDraw);
  } catch (e) {
    console.warn('[publicData] seed load failed', e);
    return [];
  }
}