// 数据模型定义

export interface LotteryDraw {
  id: string;
  code: string;        // 期号，如 2024001
  date: string;        // 开奖日期 ISO
  front: number[];     // 前区号码（5 个）
  back: number[];      // 后区号码（2 个）
  prizePool?: number;  // 奖池金额（元）
  sales?: number;      // 销售额（元）
}

export interface NumberStat {
  number: number;
  frequency: number;   // 出现次数
  missing: number;     // 当前遗漏期数
  avgMissing: number;  // 平均遗漏
  hot: boolean;        // 是否热号
  zoneIndex: number;   // 所属区间索引
}

export interface RecommendSet {
  id: string;
  front: number[];
  back: number[];
  score: number;
  createdAt: number;
  reason?: string;
}

export interface FavoriteSet {
  id: string;
  front: number[];
  back: number[];
  notify: boolean;
  createdAt: number;
  remark?: string;
}

export interface Weights {
  frequency: number;
  missing: number;
  zoneBalance: number;
}

export interface PageResult<T> {
  list: T[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}