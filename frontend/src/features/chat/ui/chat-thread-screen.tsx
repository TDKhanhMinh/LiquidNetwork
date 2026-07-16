"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ImageIcon,
  MapPinIcon,
  SendIcon,
} from "lucide-react";
import type { ChatMessage } from "@/entities/chat";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/shared/ui/message";
import { Bubble, BubbleContent } from "@/shared/ui/bubble";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import {
  useConversation,
  useMarkChatRead,
  useMessages,
  useSendMessage,
} from "../hook/use-chat";

const ME_ID = "mock-user";

function MessageBubble({ message }: { message: ChatMessage }) {
  const mine = message.senderId === ME_ID;
  const { t } = useAppTranslation("chat");

  return (
    <Message align={mine ? "end" : "start"}>
      {!mine ? (
        <div className="flex size-8 shrink-0 items-center justify-center self-end rounded-full bg-muted text-xs font-bold">
          {message.senderName.slice(0, 1)}
        </div>
      ) : null}
      <MessageContent>
        {!mine ? (
          <p className="px-1 text-[11px] font-medium text-muted-foreground">
            {message.senderName}
          </p>
        ) : null}
        <Bubble variant={mine ? "default" : "muted"} align={mine ? "end" : "start"}>
          <BubbleContent className="rounded-2xl px-3 py-2 text-sm">
            {message.type === "image" ? (
              <div className="space-y-1">
                <div className="flex h-28 w-40 items-center justify-center rounded-xl bg-background/20">
                  <ImageIcon className="size-8 opacity-70" />
                </div>
                <p className="text-xs opacity-80">{t("thread.imagePlaceholder")}</p>
              </div>
            ) : message.type === "location" ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="size-4 shrink-0" />
                  <span className="font-medium">
                    {message.location?.label || t("thread.locationShared")}
                  </span>
                </div>
                {message.location ? (
                  <p className="font-mono text-[10px] opacity-70">
                    {message.location.lat.toFixed(4)},{" "}
                    {message.location.lng.toFixed(4)}
                  </p>
                ) : null}
                {message.text ? <p>{message.text}</p> : null}
              </div>
            ) : (
              <p className="whitespace-pre-wrap wrap-break-word">
                {message.text}
              </p>
            )}
          </BubbleContent>
        </Bubble>
        <MessageFooter>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}

interface ChatThreadScreenProps {
  conversationId: string;
}

export function ChatThreadScreen({ conversationId }: ChatThreadScreenProps) {
  const { t, ready } = useAppTranslation(["chat", "common"]);
  const conv = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const markRead = useMarkChatRead(conversationId);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark once on open
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data?.length]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || send.isPending) return;
    setText("");
    await send.mutateAsync({ type: "text", text: value });
  }

  async function sendImage() {
    await send.mutateAsync({
      type: "image",
      imageUrl: "https://placehold.co/300x200/amber/111?text=LN",
      text: t("thread.imagePlaceholder"),
    });
  }

  async function sendLocation() {
    await send.mutateAsync({
      type: "location",
      location: {
        lat: 10.7769,
        lng: 106.7009,
        label: "Vị trí hiện tại (demo)",
      },
      text: t("thread.locationShared"),
    });
  }

  if (!ready || conv.isLoading || messages.isLoading) return <PageLoading />;
  if (conv.isError || messages.isError || !conv.data) {
    return (
      <PageErrorInline
        onRetry={() => {
          void conv.refetch();
          void messages.refetch();
        }}
      />
    );
  }

  const conversation = conv.data;
  const list = messages.data ?? [];

  const contextHref =
    conversation.context.type === "session" && conversation.context.refId
      ? routes.sessionDetail(conversation.context.refId)
      : conversation.context.type === "queue" && conversation.context.refId
        ? routes.queueLive(conversation.context.refId)
        : conversation.context.type === "session"
          ? routes.sessions
          : conversation.context.type === "queue"
            ? routes.queue
            : null;

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] w-full flex-col md:h-[calc(100dvh-9rem)]">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-border px-3 py-3 md:px-4 md:py-3.5">
        <Link
          href={routes.chat}
          className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
          aria-label={t("common:actions.back")}
        >
          <ArrowLeftIcon className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold">
            {conversation.title}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.type === "group"
              ? t("thread.members", {
                  count: conversation.participants.length,
                })
              : t("thread.direct")}
          </p>
        </div>
        {conversation.context.type !== "none" ? (
          contextHref ? (
            <Link href={contextHref}>
              <Badge variant="secondary" className="max-w-28 truncate">
                {conversation.context.type === "session"
                  ? t("context.session")
                  : t("context.queue")}
              </Badge>
            </Link>
          ) : (
            <Badge variant="secondary">
              {conversation.context.type === "session"
                ? t("context.session")
                : t("context.queue")}
            </Badge>
          )
        ) : null}
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t("thread.empty")}
          </p>
        ) : (
          <MessageGroup>
            {list.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </MessageGroup>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-border bg-card/80 px-3 py-3 backdrop-blur-md"
      >
        <div className="mb-2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-xl"
            onClick={() => void sendImage()}
            disabled={send.isPending}
            aria-label={t("thread.attachImage")}
          >
            <ImageIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-xl"
            onClick={() => void sendLocation()}
            disabled={send.isPending}
            aria-label={t("thread.shareLocation")}
          >
            <MapPinIcon className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("thread.placeholder")}
            className="h-11 min-h-11 flex-1 rounded-xl bg-muted/40"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            className={cn("size-11 shrink-0 rounded-xl")}
            disabled={!text.trim() || send.isPending}
            aria-label={t("thread.send")}
          >
            <SendIcon className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
