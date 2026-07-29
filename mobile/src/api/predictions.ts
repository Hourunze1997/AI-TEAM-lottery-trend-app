import { apiClient } from './client';

export type Algorithm = 'cold_hot' | 'missing' | 'mean_revert' | 'random';

export interface PredictionOut {
  algorithm: Algorithm;
  algorithm_label: string;
  front_numbers: number[];
  back_numbers: number[];
  confidence: number;
  rationale?: string;
}

export interface PredictionListOut {
  target_period: string;
  predictions: PredictionOut[];
  generated_at: string;
}

export async function fetchPredictions(target_period: string): Promise<PredictionListOut> {
  const res = await apiClient.get('/predictions/next', { params: { target_period } });
  return res.data;
}
