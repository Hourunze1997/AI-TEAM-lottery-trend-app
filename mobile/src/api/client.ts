import axios, { AxiosError, AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { store } from '../store';
import { clearToken } from '../store/authSlice';

export interface ErrorOut {
  error: { code: string; message: string; details?: Record<string, unknown> };
  request_id: string;
}

const baseURL =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ?? 'http://localhost:8000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const state: any = store.getState();
  const token = state?.auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ErrorOut>) => {
    const body = err.response?.data;
    if (body?.error?.code === 'UNAUTHORIZED') {
      store.dispatch(clearToken());
    }
    if (body?.error?.code === 'DEVICE_NOT_REGISTERED') {
      // 清理本地 push_token
      store.dispatch(clearToken());
    }
    return Promise.reject(err);
  },
);

export function extractError(e: unknown): { code: string; message: string } {
  if (axios.isAxiosError(e)) {
    const body = e.response?.data as ErrorOut | undefined;
    if (body?.error) {
      return { code: body.error.code, message: body.error.message };
    }
    return { code: 'NETWORK_ERROR', message: e.message };
  }
  return { code: 'UNKNOWN', message: String(e) };
}
