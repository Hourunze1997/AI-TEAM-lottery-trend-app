import { useEffect, useState } from 'react';
import { DrawRecord, NumberStat } from '../types/models';
import { calcNumberStats, calcFrontHot, calcBackCold, calcTrend, rangeDistribution } from '../services/statistics';
import { getAllMockData } from '../api/lottery';

export function useTrendData(n: number) {
  const [frontHot, setFrontHot] = useState<NumberStat[]>([]);
  const [backCold, setBackCold] = useState<NumberStat[]>([]);
  const [trend, setTrend] = useState<{ period: string; fronts: number[]; backs: number[] }[]>([]);
  const [rangePie, setRangePie] = useState<{ name: string; population: number }[]>([]);
  const [records, setRecords] = useState<DrawRecord[]>([]);

  useEffect(() => {
    const all = getAllMockData();
    setRecords(all);
    const stats = calcNumberStats(all);
    setFrontHot(calcFrontHot(stats, 10));
    setBackCold(calcBackCold(stats, 5));
    setTrend(calcTrend(all, n));
    setRangePie(rangeDistribution(all));
  }, [n]);

  return { frontHot, backCold, trend, rangePie, records };
}