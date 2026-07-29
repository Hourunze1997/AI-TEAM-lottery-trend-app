import { apiClient } from './client';

export interface FavoriteOut {
  id: number;
  user_id: number;
  front_numbers: number[];
  back_numbers: number[];
  tag?: string;
  hit_count: number;
  best_rank?: string;
  created_at: string;
}

export interface HitStat {
  favorite_id: number;
  front_numbers: number[];
  back_numbers: number[];
  hit_count: number;
  best_rank?: string;
  last_hit_period?: string;
  last_hit_at?: string;
}

export async function listFavorites(): Promise<FavoriteOut[]> {
  const res = await apiClient.get('/favorites');
  return res.data;
}

export async function createFavorite(payload: {
  front_numbers: number[];
  back_numbers: number[];
  tag?: string;
}): Promise<FavoriteOut> {
  const res = await apiClient.post('/favorites', payload);
  return res.data;
}

export async function deleteFavorite(id: number): Promise<{ ok: boolean }> {
  const res = await apiClient.delete(`/favorites/${id}`);
  return res.data;
}

export async function fetchHitStats(): Promise<HitStat[]> {
  const res = await apiClient.get('/favorites/hit-stats');
  return res.data;
}
