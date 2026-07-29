import { apiClient } from './client';

export interface FreqItem {
  zone: string;
  number: number;
  count: number;
  miss: number;
  frequency: number;
}

export interface ZoneStats {
  zone: string;
  odd_even_ratio: string;
  big_small_ratio: string;
  consecutive_count: number;
  most_frequent: number[];
  least_frequent: number[];
}

export async function fetchFrequencies(params: { zone: 'front' | 'back'; range: 30 | 60 | 'all' }) {
  const { data } = await apiClient.get('/frequencies', { params });
  return data as FreqItem[];
}

export async function fetchZoneStats(params: { zone: 'front' | 'back'; range: 30 | 60 | 'all' }) {
  const { data } = await apiClient.get('/frequencies/stats', { params });
  return data as ZoneStats;
}