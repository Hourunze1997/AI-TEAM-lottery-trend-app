import { useCallback, useState } from 'react';
import { Recommendation, AlgorithmKey, DrawRecord } from '../types/models';
import {
  recommendByFrequency,
  recommendByMiss,
  recommendByWeighted,
  recommendHybrid,
} from '../services/recommendation';
import { getAllMockData } from '../api/lottery';

export function useRecommendation() {
  const [result, setResult] = useState<Recommendation | null>(null);

  const generate = useCallback((algo: AlgorithmKey) => {
    const records: DrawRecord[] = getAllMockData();
    let rec: Recommendation;
    switch (algo) {
      case 'frequency':
        rec = recommendByFrequency(records);
        break;
      case 'miss':
        rec = recommendByMiss(records);
        break;
      case 'weighted':
        rec = recommendByWeighted(records);
        break;
      case 'hybrid':
      default:
        rec = recommendHybrid(records);
        break;
    }
    setResult(rec);
  }, []);

  return { result, generate };
}