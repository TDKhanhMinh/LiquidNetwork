import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type { AppNotification, NotificationPrefs } from "../model/types";
import { notificationMockStore } from "../lib/mock-store";

function isNotReadyError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 0 ||
      err.status === 404 ||
      err.status === 501 ||
      err.status === 401
    );
  }
  const code = (err as { code?: string })?.code;
  return code === "ERR_NETWORK" || code === "ECONNABORTED";
}

const useMock =
  env.authMock ||
  process.env.NEXT_PUBLIC_NOTIF_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_NOTIF_MOCK !== "false");

export const notificationApi = {
  async list(): Promise<AppNotification[]> {
    try {
      return await apiClient.get<AppNotification[]>("/notifications");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return notificationMockStore.list();
      }
      throw err;
    }
  },

  async markRead(id: string): Promise<AppNotification> {
    try {
      return await apiClient.post<AppNotification>(
        `/notifications/${id}/read`,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return notificationMockStore.markRead(id);
      }
      throw err;
    }
  },

  async markAllRead(): Promise<void> {
    try {
      await apiClient.post<void>("/notifications/read-all");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        notificationMockStore.markAllRead();
        return;
      }
      throw err;
    }
  },

  async unreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<{ count: number }>(
        "/notifications/unread-count",
      );
      return res.count;
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return notificationMockStore.unreadCount();
      }
      throw err;
    }
  },

  async getPrefs(): Promise<NotificationPrefs> {
    try {
      return await apiClient.get<NotificationPrefs>(
        "/notifications/prefs",
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return notificationMockStore.getPrefs();
      }
      throw err;
    }
  },

  async updatePrefs(
    prefs: Partial<NotificationPrefs>,
  ): Promise<NotificationPrefs> {
    try {
      return await apiClient.patch<NotificationPrefs>(
        "/notifications/prefs",
        prefs,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return notificationMockStore.setPrefs(prefs);
      }
      throw err;
    }
  },
};
