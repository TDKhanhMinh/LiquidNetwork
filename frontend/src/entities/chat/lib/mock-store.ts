import type {
  ChatMessage,
  Conversation,
  CreateConversationInput,
  SendMessageInput,
} from "../model/types";

const CONV_KEY = "ln.chat_conversations";
const MSG_KEY = "ln.chat_messages";

const ME = { id: "mock-user", name: "Bạn" };

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ln-chat-changed"));
  }
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function listConversations(): Conversation[] {
  return readJson<Conversation[]>(CONV_KEY, []);
}

function saveConversations(items: Conversation[]) {
  writeJson(CONV_KEY, items);
}

function listMessages(): ChatMessage[] {
  return readJson<ChatMessage[]>(MSG_KEY, []);
}

function saveMessages(items: ChatMessage[]) {
  writeJson(MSG_KEY, items);
}

function seedIfEmpty() {
  if (listConversations().length > 0) return;

  const directId = id("c");
  const groupId = id("c");
  const queueId = id("c");
  const sessionId = id("c");

  const msg1: ChatMessage = {
    id: id("m"),
    conversationId: directId,
    senderId: "u-minh",
    senderName: "Minh Bia",
    type: "text",
    text: "Tối nay bàn Q1 nhé?",
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  };
  const msg2: ChatMessage = {
    id: id("m"),
    conversationId: groupId,
    senderId: "u-ha",
    senderName: "Hà Networking",
    type: "text",
    text: "Team ơi, 19h ok không?",
    createdAt: new Date(Date.now() - 1800_000).toISOString(),
  };
  const msg3: ChatMessage = {
    id: id("m"),
    conversationId: queueId,
    senderId: "system",
    senderName: "Queue",
    type: "text",
    text: "Bạn đang trong hàng chờ mời — phản hồi nhanh giúp nhé.",
    createdAt: new Date(Date.now() - 600_000).toISOString(),
  };
  const msg4: ChatMessage = {
    id: id("m"),
    conversationId: sessionId,
    senderId: "u-lan",
    senderName: "Lan Chill",
    type: "location",
    location: {
      lat: 10.7769,
      lng: 106.7009,
      label: "Nguyễn Huệ, Q1",
    },
    text: "Mình đang ở đây",
    createdAt: new Date(Date.now() - 300_000).toISOString(),
  };

  const conversations: Conversation[] = [
    {
      id: directId,
      type: "direct",
      title: "Minh Bia",
      participants: [ME, { id: "u-minh", name: "Minh Bia" }],
      context: { type: "none" },
      lastMessage: msg1,
      unreadCount: 2,
      updatedAt: msg1.createdAt,
    },
    {
      id: groupId,
      type: "group",
      title: "Bàn Networking T6",
      participants: [
        ME,
        { id: "u-ha", name: "Hà Networking" },
        { id: "u-huy", name: "Huy Chiến" },
      ],
      context: { type: "none" },
      lastMessage: msg2,
      unreadCount: 1,
      updatedAt: msg2.createdAt,
    },
    {
      id: queueId,
      type: "direct",
      title: "Queue · Phong Trần",
      participants: [ME, { id: "u-phong", name: "Phong Trần" }],
      context: {
        type: "queue",
        refId: "q_demo",
        label: "Hàng chờ mời",
      },
      lastMessage: msg3,
      unreadCount: 1,
      updatedAt: msg3.createdAt,
    },
    {
      id: sessionId,
      type: "group",
      title: "Session · Tâm sự",
      participants: [
        ME,
        { id: "u-lan", name: "Lan Chill" },
        { id: "u-duc", name: "Đức Tài" },
      ],
      context: {
        type: "session",
        refId: "sess_demo",
        label: "Buổi tiệc đang diễn ra",
      },
      lastMessage: msg4,
      unreadCount: 0,
      updatedAt: msg4.createdAt,
    },
  ];

  saveConversations(conversations);
  saveMessages([msg1, msg2, msg3, msg4]);
}

export const chatMockStore = {
  listConversations(): Conversation[] {
    seedIfEmpty();
    return listConversations().sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  },

  getConversation(id: string): Conversation | null {
    seedIfEmpty();
    return listConversations().find((c) => c.id === id) ?? null;
  },

  listMessages(conversationId: string): ChatMessage[] {
    seedIfEmpty();
    return listMessages()
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  sendMessage(conversationId: string, input: SendMessageInput): ChatMessage {
    seedIfEmpty();
    const convs = listConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx < 0) throw new Error("Conversation not found");

    const message: ChatMessage = {
      id: id("m"),
      conversationId,
      senderId: ME.id,
      senderName: ME.name,
      type: input.type,
      text: input.text,
      imageUrl: input.imageUrl,
      location: input.location,
      createdAt: nowIso(),
    };

    const messages = listMessages();
    messages.push(message);
    saveMessages(messages);

    convs[idx] = {
      ...convs[idx]!,
      lastMessage: message,
      unreadCount: 0,
      updatedAt: message.createdAt,
    };
    saveConversations(convs);
    return message;
  },

  markRead(conversationId: string): Conversation {
    seedIfEmpty();
    const convs = listConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx < 0) throw new Error("Conversation not found");
    convs[idx] = { ...convs[idx]!, unreadCount: 0 };
    saveConversations(convs);
    return convs[idx]!;
  },

  createConversation(input: CreateConversationInput): Conversation {
    seedIfEmpty();
    const participants = [
      ME,
      ...input.participantIds.map((pid) => ({
        id: pid,
        name: input.participantNames?.[pid] ?? pid,
      })),
    ];
    const title =
      input.title?.trim() ||
      (input.type === "direct"
        ? participants.find((p) => p.id !== ME.id)?.name || "Chat"
        : "Nhóm mới");

    const conv: Conversation = {
      id: id("c"),
      type: input.type,
      title,
      participants,
      context: input.context ?? { type: "none" },
      lastMessage: null,
      unreadCount: 0,
      updatedAt: nowIso(),
    };
    const convs = listConversations();
    convs.unshift(conv);
    saveConversations(convs);
    return conv;
  },

  totalUnread(): number {
    return this.listConversations().reduce((sum, c) => sum + c.unreadCount, 0);
  },
};

export function subscribeChatStore(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("ln-chat-changed", cb);
  return () => window.removeEventListener("ln-chat-changed", cb);
}
