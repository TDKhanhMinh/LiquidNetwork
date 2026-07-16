export type ChatType = "direct" | "group";

export type ChatContextType = "session" | "queue" | "none";

export type MessageType = "text" | "image" | "location";

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
}

export interface ChatContext {
  type: ChatContextType;
  refId?: string;
  label?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
    label?: string;
  };
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ChatType;
  title: string;
  participants: ChatParticipant[];
  context: ChatContext;
  lastMessage?: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageInput {
  type: MessageType;
  text?: string;
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
    label?: string;
  };
}

export interface CreateConversationInput {
  type: ChatType;
  title?: string;
  participantIds: string[];
  participantNames?: Record<string, string>;
  context?: ChatContext;
}
