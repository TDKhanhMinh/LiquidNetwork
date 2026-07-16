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
  get<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    return axiosInstance
      .get<T>(url, config as AppAxiosRequestConfig)
      .then((res) => res.data);
  },

  post<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    return axiosInstance
      .post<T>(url, body, config as AppAxiosRequestConfig)
      .then((res) => res.data);
  },

  put<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    return axiosInstance
      .put<T>(url, body, config as AppAxiosRequestConfig)
      .then((res) => res.data);
  },

  patch<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    return axiosInstance
      .patch<T>(url, body, config as AppAxiosRequestConfig)
      .then((res) => res.data);
  },

  delete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    return axiosInstance
      .delete<T>(url, config as AppAxiosRequestConfig)
      .then((res) => res.data);
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
