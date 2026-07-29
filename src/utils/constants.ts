// 常量定义
export const FRONT_RANGE = { min: 1, max: 35, count: 5 } as const;
export const BACK_RANGE = { min: 1, max: 12, count: 2 } as const;

// 自建后端地址（占位，运行时由 Settings 配置覆盖）
export const API_BASE_URL = '';

// 公开数据源 URL（GitHub raw，来源 yangxb919/lottery-data）
// 前区 1-35 选 5，后区 1-12 选 2：大乐透
export const PUBLIC_DATA_URL = 'https://raw.githubusercontent.com/yangxb919/lottery-data/main/data/dlt.json';

// 前区区间划分（1-35 分为 5 个区间）
export const FRONT_ZONES: number[][] = [
  [1, 7],
  [8, 14],
  [15, 21],
  [22, 28],
  [29, 35],
];

export const BACK_ZONES: number[][] = [
  [1, 4],
  [5, 8],
  [9, 12],
];

// 推荐权重
export const DEFAULT_WEIGHTS = {
  frequency: 0.4,
  missing: 0.4,
  zoneBalance: 0.2,
};

// 存储 key
export const STORAGE_KEYS = {
  HISTORY: '@lottery/history',
  FAVORITES: '@lottery/favorites',
  LASTEST: '@lottery/latest',
};

// 趋势图分析期数
export const TREND_PERIODS = 30;