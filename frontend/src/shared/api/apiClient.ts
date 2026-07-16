import type { AxiosRequestConfig } from "axios";
import { axiosInstance, type AppAxiosRequestConfig } from "./axiosInstance";
import type { ApiResponse, RequestConfigExtras } from "./types";

export type ApiRequestConfig = Omit<AxiosRequestConfig, "params"> &
  RequestConfigExtras & {
    params?: Record<string, unknown>;
  };

/**
 * Typed HTTP helpers on top of {@link axiosInstance}.
 * Response interceptor already unwraps `data` when `success: true`.
 */
export const apiClient = {
  async get<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    const res = await axiosInstance
      .get<T>(url, config as AppAxiosRequestConfig);
    return res.data;
  },

  async post<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    const res = await axiosInstance
      .post<T>(url, body, config as AppAxiosRequestConfig);
    return res.data;
  },

  async put<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    const res = await axiosInstance
      .put<T>(url, body, config as AppAxiosRequestConfig);
    return res.data;
  },

  async patch<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    const res = await axiosInstance
      .patch<T>(url, body, config as AppAxiosRequestConfig);
    return res.data;
  },

  async delete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    const res = await axiosInstance
      .delete<T>(url, config as AppAxiosRequestConfig);
    return res.data;
  },

  /**
   * Full backend envelope (when you need `meta` / `message`).
   */
  async getEnvelope<T>(
    url: string,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    const res = await axiosInstance.get<ApiResponse<T>>(url, {
      ...config,
      rawEnvelope: true,
    } as AppAxiosRequestConfig);
    return res.data;
  },
} as const;

export default apiClient;
