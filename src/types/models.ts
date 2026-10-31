// 全局数据模型定义

export interface DrawRecord {
  period: string;          // 期号，例如 "2024001"
  drawDate: string;        // 开奖日期 ISO 字符串
  weekday: number;         // 星期 1-7（周一为1）
  front: number[];         // 前区号码（5个，1-35，升序）
  back: number[];          // 后区号码（2个，1-12，升序）
  jackpot?: string;        // 奖池金额
  sales?: string;          // 销量
  prize?: string;          // 一等奖奖金
}

export interface NumberStat {
  number: number;          // 号码
  area: 'front' | 'back';  // 所属区
  count: number;           // 出现次数
  miss: number;            // 当前遗漏期数
  avgMiss: number;         // 平均遗漏
  rank: number;            // 排名
}

export interface MatchResult {
  period: string;
  drawDate: string;
  frontHit: number;        // 命中前区个数
  backHit: number;         // 命中后区个数
}

export interface Favorite {
  favId: string;           // UUID
  front: number[];
  back: number[];
  label?: string;
  createdAt: string;
  matchedHistory: MatchResult[];
}

export interface Reminder {
  notifId?: string;
  weekday: number;         // 1/3/6 大乐透开奖日
  hour: number;
  minute: number;
  enabled: boolean;
  title: string;
  body: string;
}