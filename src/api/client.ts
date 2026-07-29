import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';

// 创建 axios 实例
export function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 这里可以注入 token 等
      return config;
    },
    (err) => Promise.reject(err)
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
    }
  );

  return instance;
}

export const http = createClient();