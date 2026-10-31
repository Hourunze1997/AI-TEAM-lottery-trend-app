import { apiClient } from './client';

export interface PickerRules {
  max_consecutive?: number;
  sum_range?: [number, number];
  note?: string;
}

export interface TicketOut {
  front_numbers: number[];
  back_numbers: number[];
}

export interface PickerOut {
  count: number;
  rules: PickerRules;
  tickets: TicketOut[];
  disclaimer: string;
  generated_at: string;
}

export async function fetchTickets(
  params: {
    count?: number;
    max_consecutive?: number;
    sum_min?: number;
    sum_max?: number;
  } = {},
): Promise<PickerOut> {
  const res = await apiClient.get('/picker/generate', { params });
  return res.data;
}
