export type NotificationCategory =
  | "queue"
  | "session"
  | "review"
  | "system"
  | "chat";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  inApp: boolean;
  categories: {
    queue: boolean;
    session: boolean;
    review: boolean;
    system: boolean;
    chat: boolean;
  };
}
