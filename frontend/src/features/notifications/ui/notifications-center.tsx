"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BellIcon,
  CalendarIcon,
  ListOrderedIcon,
  MessageCircleIcon,
  SettingsIcon,
  StarIcon,
} from "lucide-react";
import type {
  AppNotification,
  NotificationCategory,
} from "@/entities/notification";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hook/use-notifications";

const CATEGORIES: Array<NotificationCategory | "all"> = [
  "all",
  "queue",
  "session",
  "review",
  "chat",
  "system",
];

function CategoryIcon({ category }: { category: NotificationCategory }) {
  const cls = "size-4";
  switch (category) {
    case "queue":
      return <ListOrderedIcon className={cls} />;
    case "session":
      return <CalendarIcon className={cls} />;
    case "review":
      return <StarIcon className={cls} />;
    case "chat":
      return <MessageCircleIcon className={cls} />;
    default:
      return <BellIcon className={cls} />;
  }
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: AppNotification;
  onOpen: (item: AppNotification) => void;
}) {
  const { t } = useAppTranslation("notification");
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        "flex w-full gap-3 rounded-2xl border px-3 py-3 text-left transition-colors active:bg-muted",
        item.read
          ? "border-border bg-card"
          : "border-primary/30 bg-primary/5 shadow-amber-glow",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          item.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary",
        )}
      >
        <CategoryIcon category={item.category} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={
              item.read
                ? "text-sm font-medium"
                : "text-sm font-semibold"
            }
          >
            {item.title}
          </p>
          {!item.read ? (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {item.body}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {t(`categories.${item.category}`)}
          </Badge>
          <time className="text-[10px] text-muted-foreground">
            {new Date(item.createdAt).toLocaleString()}
          </time>
        </div>
      </div>
    </button>
  );
}

export function NotificationsCenter() {
  const { t, ready } = useAppTranslation(["notification", "common"]);
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [category, setCategory] = useState<NotificationCategory | "all">(
    "all",
  );

  const filtered = useMemo(() => {
    const items = data ?? [];
    if (category === "all") return items;
    return items.filter((n) => n.category === category);
  }, [data, category]);

  const unread = (data ?? []).filter((n) => !n.read).length;

  if (!ready || isLoading) return <PageLoading />;
  if (isError) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  function handleOpen(item: AppNotification) {
    if (!item.read) markRead.mutate(item.id);
    if (item.href && typeof window !== "undefined") {
      window.location.href = item.href;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          href={routes.notificationSettings}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
          aria-label={t("settings.title")}
        >
          <SettingsIcon className="size-5" />
        </Link>
      </header>

      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {unread > 0
            ? t("unreadCount", { count: unread })
            : t("allRead")}
        </p>
        {unread > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            {t("markAllRead")}
          </Button>
        ) : null}
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
              category === c
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {t(`categories.${c}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <PageEmpty
          title={t("empty.title")}
          description={t("empty.description")}
          compact
        />
      ) : (
        <ul className="space-y-2 pb-4">
          {filtered.map((item) => (
            <li key={item.id}>
              <NotificationRow item={item} onOpen={handleOpen} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
