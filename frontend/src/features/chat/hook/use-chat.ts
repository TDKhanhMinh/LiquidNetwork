"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  chatApi,
  chatKeys,
  subscribeChatStore,
  type SendMessageInput,
} from "@/entities/chat";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function useConversations() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => chatApi.listConversations(),
  });

  useEffect(() => {
    return subscribeChatStore(() => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all });
    });
  }, [queryClient]);

  return query;
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: chatKeys.conversation(id ?? ""),
    queryFn: () => chatApi.getConversation(id!),
    enabled: Boolean(id),
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId ?? ""),
    queryFn: () => chatApi.listMessages(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 4000,
  });
}

export function useChatUnread() {
  return useQuery({
    queryKey: chatKeys.unread(),
    queryFn: () => chatApi.unreadCount(),
    refetchInterval: 10_000,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: (input: SendMessageInput) =>
      chatApi.sendMessage(conversationId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
      void queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
    },
    onError: (e) => notifyError(e, t),
  });
}

export function useMarkChatRead(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chatApi.markRead(conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
