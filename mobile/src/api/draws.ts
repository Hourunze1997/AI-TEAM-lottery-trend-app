import { apiClient } from './client';

export interface DrawListItem {
  id: number;
  period: string;
  draw_date: string;
  front_numbers: number[];
  back_numbers: number[];
  prize_pool?: number;
  highlight?: number[];
  highlight_mode?: string;
}

export interface DrawListResponse {
  items: DrawListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface DrawOut extends DrawListItem {
  source?: string;
  highlight_meta?: Record<string, unknown>;
}

export async function fetchDraws(params: {
  page?: number;
  page_size?: number;
  keyword?: string;
  highlight?: 'favorites' | 'prediction' | 'latest';
  user_id?: number;
}): Promise<DrawListResponse> {
  const res = await apiClient.get('/draws', { params });
  return res.data;
}

export async function fetchDrawByPeriod(
  period: string,
  params: { highlight?: 'favorites' | 'prediction' | 'latest'; user_id?: number } = {},
): Promise<DrawOut> {
  const res = await apiClient.get(`/draws/${encodeURIComponent(period)}`, { params });
  return res.data;
}
