import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { loadItem } from '../services/storageService';

// 启动时异步读用户配置的后端地址，覆盖默认占位
let runtimeBaseURL: string | null = null;

export async function initBaseURL(): Promise<string> {
  const override = await loadItem<string>('@lottery/api_base_url');
  runtimeBaseURL = override && override.trim() ? override.trim() : null;
  return runtimeBaseURL || API_BASE_URL;
}

// 创建 axios 实例
export function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: runtimeBaseURL || API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 每次请求前重新拉一次最新 baseURL（用户在 Settings 改了立即生效）
      if (runtimeBaseURL) {
        config.baseURL = runtimeBaseURL;
      }
      // 这里可以注入 token 等
      return config;
    },
    (err) => Promise.reject(err),
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (resp) => resp.data,
    (err: AxiosError) => {
      // 统一错误处理
      const msg =
        (err.response && (err.response.data as any)?.message) ||
        err.message ||
        '网络请求失败';
      // eslint-disable-next-line no-console
      console.warn('[API Error]', msg);
      return Promise.reject(new Error(msg));
    },
  );

  return instance;
}

export const http = createClient();

/**
 * 由 SettingsScreen 在保存新 URL 后调用，更新内存中的 baseURL
 */
export function setRuntimeBaseURL(url: string | null): void {
  runtimeBaseURL = url && url.trim() ? url.trim() : null;
}

export function getRuntimeBaseURL(): string {
  return runtimeBaseURL || API_BASE_URL;
}