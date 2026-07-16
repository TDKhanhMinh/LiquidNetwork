"use client";

import Link from "next/link";
import {
  ImageIcon,
  MapPinIcon,
  MessagesSquareIcon,
  UsersIcon,
} from "lucide-react";
import type { Conversation } from "@/entities/chat";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Badge } from "@/shared/ui/badge";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useConversations } from "../hook/use-chat";

function previewText(conv: Conversation, t: (k: string) => string): string {
  const m = conv.lastMessage;
  if (!m) return t("list.noMessages");
  if (m.type === "image") return t("list.previewImage");
  if (m.type === "location") return t("list.previewLocation");
  return m.text || "";
}

function ContextBadge({ conv }: { conv: Conversation }) {
  const { t } = useAppTranslation("chat");
  if (conv.context.type === "session") {
    return <Badge variant="secondary">{t("context.session")}</Badge>;
  }
  if (conv.context.type === "queue") {
    return <Badge className="bg-primary/15 text-primary">{t("context.queue")}</Badge>;
  }
  if (conv.type === "group") {
    return (
      <Badge variant="outline" className="gap-1">
        <UsersIcon className="size-3" />
        {t("list.group")}
      </Badge>
    );
  }
  return null;
}

export function ChatListScreen() {
  const { t, ready } = useAppTranslation(["chat", "common"]);
  const { data, isLoading, isError, refetch } = useConversations();

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

  const items = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
      <header className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      {items.length === 0 ? (
        <PageEmpty
          title={t("list.emptyTitle")}
          description={t("list.emptyDescription")}
          compact
        />
      ) : (
        <ul className="space-y-1">
          {items.map((conv) => (
            <li key={conv.id}>
              <Link
                href={routes.chatThread(conv.id)}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-transparent px-2 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
              >
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-base font-bold text-primary">
                  {conv.type === "group" ? (
                    <MessagesSquareIcon className="size-5" />
                  ) : (
                    conv.title.slice(0, 1)
                  )}
                  {conv.unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={
                        conv.unreadCount > 0
                          ? "truncate text-sm font-semibold"
                          : "truncate text-sm font-medium"
                      }
                    >
                      {conv.title}
                    </p>
                    <time className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {previewText(conv, t)}
                    </p>
                    <ContextBadge conv={conv} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
