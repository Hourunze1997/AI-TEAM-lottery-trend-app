# Lottery Trend App

大乐透开奖数据浏览 + 随机选号 Expo (React Native + TypeScript) App（可选 FastAPI 后端）。

## 功能
- 历史开奖列表（分页 + 搜索 + 下拉刷新）
- 开奖详情
- 走势分析（折线 + 饼图）
- 随机选号：纯随机生成，可选"连号上限 / 和值范围"观感规则
- 收藏管理 + 历史匹配
- 周开奖提醒

## 本应用不做什么（重要）
- **不预测、不推荐、不宣称提升中奖概率。** 开奖号码完全随机，任何选号方式
  都不改变中奖概率；彩票长期返奖率约 50%。
- 本仓库曾内置"预测/推荐"框架（冷热号/遗漏值/均值回归/加权融合四种算法）。
  `scripts/backtest.py` 用 2941 期真实开奖对其回测：2014 年后与纯随机统计上
  无法区分（|z| < 2），全部 11284 注预测头奖命中 0 次，已于 2026-10 全部移除。
  结论可随时复现：`python3 scripts/backtest.py`

## 数据来源
- 开奖数据抓取自 500.com 公开页面（`backend/app/services/crawler.py`）；
- 历史回测快照 `scripts/dlt_history.json`（2007-05-30 ~ 2026-10-28，共 2941 期，
  已用独立数据源对 1913 个重叠期逐期核对，0 期不一致）。

## 启动

根目录自足版（本地随机选号，无需后端）：
```bash
npm install
npm start
```

后端 + mobile 版：
```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd mobile && npm install && npm start
```

后端测试：
```bash
cd backend && JOB_MISS_RETRY_INTERVAL=1 python -m pytest -q
```
