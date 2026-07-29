// 大乐透规则常量
export const LOTTERY = {
  FRONT_COUNT: 5,
  BACK_COUNT: 2,
  FRONT_MAX: 35,
  FRONT_MIN: 1,
  BACK_MAX: 12,
  BACK_MIN: 1,

  // 开奖日: 周一、周三、周六 -> weekday 1,3,6
  DRAW_WEEKDAYS: [1, 3, 6] as const,

  NAME: '大乐透',
};