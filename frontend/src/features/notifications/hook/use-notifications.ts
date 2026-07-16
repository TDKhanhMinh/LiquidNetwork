"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  notificationApi,
  notificationKeys,
  subscribeNotificationStore,
  type NotificationPrefs,
} from "@/entities/notification";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function useNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationApi.list(),
  });

  useEffect(() => {
    return subscribeNotificationStore(() => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    });
  }, [queryClient]);

  return query;
}

export function useNotificationUnread() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationApi.unreadCount(),
    refetchInterval: 15_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    onError: (e) => notifyError(e, t),
  });
}

export function useNotificationPrefs() {
  return useQuery({
    queryKey: notificationKeys.prefs(),
    queryFn: () => notificationApi.getPrefs(),
  });
}

export function useUpdateNotificationPrefs() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: (prefs: Partial<NotificationPrefs>) =>
      notificationApi.updatePrefs(prefs),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.prefs(),
      });
    },
    onError: (e) => notifyError(e, t),
  });
}
