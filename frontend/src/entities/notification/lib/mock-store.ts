import type {
  AppNotification,
  NotificationPrefs,
} from "../model/types";

const LIST_KEY = "ln.notifications";
const PREFS_KEY = "ln.notification_prefs";

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
    window.dispatchEvent(new Event("ln-notif-changed"));
  }
}

function nowIso() {
  return new Date().toISOString();
}

function id() {
  return `n_${Math.random().toString(36).slice(2, 10)}`;
}

const DEFAULT_PREFS: NotificationPrefs = {
  push: true,
  email: false,
  inApp: true,
  categories: {
    queue: true,
    session: true,
    review: true,
    system: true,
    chat: true,
  },
};

function seedIfEmpty() {
  if (readJson<AppNotification[]>(LIST_KEY, []).length > 0) return;
  const items: AppNotification[] = [
    {
      id: id(),
      category: "queue",
      title: "Lời mời đang chờ bạn",
      body: "Minh Bia đang mời bạn trong Sequential Queue — còn 45s.",
      href: "/queue",
      read: false,
      createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    },
    {
      id: id(),
      category: "session",
      title: "Buổi tiệc sắp bắt đầu",
      body: "Bàn tối Q1 bắt đầu trong 1 giờ. Check-in khi đến.",
      href: "/sessions",
      read: false,
      createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    },
    {
      id: id(),
      category: "review",
      title: "Bạn nhận peer review mới",
      body: "Lan Chill đã đánh giá bạn 5⭐.",
      href: "/profile/reviews",
      read: true,
      createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    },
    {
      id: id(),
      category: "chat",
      title: "Tin nhắn mới",
      body: "Hà Networking: Team ơi, 19h ok không?",
      href: "/chat",
      read: false,
      createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    },
    {
      id: id(),
      category: "system",
      title: "Nhắc Safe Ride",
      body: "Đã uống không lái — gọi xe về nhà an toàn.",
      href: "/safe-ride",
      read: true,
      createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    },
  ];
  writeJson(LIST_KEY, items);
}

export const notificationMockStore = {
  list(): AppNotification[] {
    seedIfEmpty();
    return readJson<AppNotification[]>(LIST_KEY, []).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  markRead(id: string): AppNotification {
    const items = this.list();
    const idx = items.findIndex((n) => n.id === id);
    if (idx < 0) throw new Error("Not found");
    items[idx] = { ...items[idx]!, read: true };
    writeJson(LIST_KEY, items);
    return items[idx]!;
  },

  markAllRead(): void {
    const items = this.list().map((n) => ({ ...n, read: true }));
    writeJson(LIST_KEY, items);
  },

  unreadCount(): number {
    return this.list().filter((n) => !n.read).length;
  },

  getPrefs(): NotificationPrefs {
    return readJson(PREFS_KEY, DEFAULT_PREFS);
  },

  setPrefs(prefs: Partial<NotificationPrefs>): NotificationPrefs {
    const current = this.getPrefs();
    const next: NotificationPrefs = {
      ...current,
      ...prefs,
      categories: {
        ...current.categories,
        ...(prefs.categories ?? {}),
      },
    };
    writeJson(PREFS_KEY, next);
    return next;
  },

  push(partial: Omit<AppNotification, "id" | "createdAt" | "read">) {
    const items = this.list();
    items.unshift({
      ...partial,
      id: id(),
      read: false,
      createdAt: nowIso(),
    });
    writeJson(LIST_KEY, items);
  },
};

export function subscribeNotificationStore(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("ln-notif-changed", cb);
  return () => window.removeEventListener("ln-notif-changed", cb);
}
