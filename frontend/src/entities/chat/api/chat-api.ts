import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  ChatMessage,
  Conversation,
  CreateConversationInput,
  SendMessageInput,
} from "../model/types";
import { chatMockStore } from "../lib/mock-store";

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
  process.env.NEXT_PUBLIC_CHAT_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_CHAT_MOCK !== "false");

export const chatApi = {
  async listConversations(): Promise<Conversation[]> {
    try {
      return await apiClient.get<Conversation[]>("/chat/conversations");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return chatMockStore.listConversations();
      }
      throw err;
    }
  },

  async getConversation(id: string): Promise<Conversation> {
    try {
      return await apiClient.get<Conversation>(`/chat/conversations/${id}`);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        const c = chatMockStore.getConversation(id);
        if (!c) throw new ApiError("Conversation not found", 404, "NOT_FOUND");
        return c;
      }
      throw err;
    }
  },

  async listMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      return await apiClient.get<ChatMessage[]>(
        `/chat/conversations/${conversationId}/messages`,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return chatMockStore.listMessages(conversationId);
      }
      throw err;
    }
  },

  async sendMessage(
    conversationId: string,
    input: SendMessageInput,
  ): Promise<ChatMessage> {
    try {
      return await apiClient.post<ChatMessage>(
        `/chat/conversations/${conversationId}/messages`,
        input,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return chatMockStore.sendMessage(conversationId, input);
      }
      throw err;
    }
  },

  async markRead(conversationId: string): Promise<Conversation> {
    try {
      return await apiClient.post<Conversation>(
        `/chat/conversations/${conversationId}/read`,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return chatMockStore.markRead(conversationId);
      }
      throw err;
    }
  },

  async createConversation(
    input: CreateConversationInput,
  ): Promise<Conversation> {
    try {
      return await apiClient.post<Conversation>("/chat/conversations", input);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return chatMockStore.createConversation(input);
      }
      throw err;
    }
  },

  async unreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<{ count: number }>("/chat/unread-count");
      return res.count;
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return chatMockStore.totalUnread();
      }
      throw err;
    }
  },
};
