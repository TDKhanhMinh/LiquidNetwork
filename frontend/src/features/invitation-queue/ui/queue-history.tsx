"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { PageEmpty, PageErrorInline, PageLoading } from "@/widgets/page-state";
import { useQueueHistory } from "../hook/use-queue-history";
import type { Invitation } from "@/entities/invitation-queue";

function InvitationRow({ item }: { item: Invitation }) {
  const { t } = useAppTranslation("invitation-queue");
  return (
    <Link
      href={routes.invitations(item.id)}
      className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-colors active:bg-muted"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-secondary/40 text-sm font-semibold">
        {(item.direction === "received"
          ? item.fromUserName
          : item.toUserName
        ).slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.direction === "received"
            ? item.fromUserName
            : item.toUserName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {item.message || item.queueId}
        </p>
      </div>
      <Badge variant="outline">{t(`status.invitation.${item.status}`)}</Badge>
    </Link>
  );
}

export function QueueHistory() {
  const { t, ready } = useAppTranslation("invitation-queue");
  const { data, isLoading, isError, refetch } = useQueueHistory();

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

  const sent = (data?.sent ?? []).map((i) => ({
    ...i,
    direction: "sent" as const,
  }));
  const received = (data?.received ?? []).map((i) => ({
    ...i,
    direction: "received" as const,
  }));

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
      <header className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("history.title")}
        </h1>
      </header>

      <Tabs defaultValue="sent" className="w-full gap-4">
        <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-muted p-1">
          <TabsTrigger value="sent" className="rounded-lg">
            {t("history.sent")}
          </TabsTrigger>
          <TabsTrigger value="received" className="rounded-lg">
            {t("history.received")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="outline-none">
          {sent.length === 0 ? (
            <PageEmpty
              title={t("history.empty")}
              description={t("history.emptyHint")}
              compact
            />
          ) : (
            <ul className="space-y-2">
              {sent.map((item) => (
                <li key={item.id}>
                  <InvitationRow item={item} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="received" className="outline-none">
          {received.length === 0 ? (
            <PageEmpty
              title={t("history.empty")}
              description={t("history.emptyHint")}
              compact
            />
          ) : (
            <ul className="space-y-2">
              {received.map((item) => (
                <li key={item.id}>
                  <InvitationRow item={item} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
