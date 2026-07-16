"use client";

import Link from "next/link";
import { CalendarIcon, HistoryIcon, PlusIcon } from "lucide-react";
import type { DrinkingSession, SessionStatus } from "@/entities/drinking-session";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useSessionsList } from "../hook/use-sessions";

function statusVariant(
  status: SessionStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "live":
      return "default";
    case "scheduled":
      return "secondary";
    case "ended":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function SessionRow({ session }: { session: DrinkingSession }) {
  const { t } = useAppTranslation("drinking-session");
  return (
    <Link
      href={routes.sessionDetail(session.id)}
      className="block rounded-xl border border-border bg-card px-3 py-3 transition-colors active:bg-muted"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{session.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {session.location}
          </p>
        </div>
        <Badge variant={statusVariant(session.status)}>
          {t(`status.${session.status}`)}
        </Badge>
      </div>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <CalendarIcon className="size-3" />
        {new Date(session.startTime).toLocaleString()}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {t("list.participants", {
          count: session.participants.length,
          max: session.maxParticipants,
        })}
      </p>
    </Link>
  );
}

export function SessionsListScreen() {
  const { t, ready } = useAppTranslation(["drinking-session", "common"]);
  const { data, isLoading, isError, refetch } = useSessionsList();

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

  const all = data ?? [];
  const upcoming = all.filter((s) => s.status === "scheduled");
  const live = all.filter((s) => s.status === "live");
  const ended = all.filter(
    (s) => s.status === "ended" || s.status === "cancelled",
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
      <header className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mb-4 flex gap-2">
        <Link
          href={routes.sessionsNew}
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-h-11 flex-1 rounded-xl",
          )}
        >
          <PlusIcon />
          {t("create")}
        </Link>
        <Link
          href={routes.sessionsHistory}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 flex-1 rounded-xl",
          )}
        >
          <HistoryIcon />
          {t("history.title")}
        </Link>
      </div>

      <Tabs defaultValue="live" className="w-full gap-4">
        <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-muted p-1">
          <TabsTrigger value="live" className="rounded-lg text-xs">
            {t("tabs.live")}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-lg text-xs">
            {t("tabs.upcoming")}
          </TabsTrigger>
          <TabsTrigger value="ended" className="rounded-lg text-xs">
            {t("tabs.ended")}
          </TabsTrigger>
        </TabsList>

        {(
          [
            ["live", live],
            ["upcoming", upcoming],
            ["ended", ended],
          ] as const
        ).map(([key, list]) => (
          <TabsContent key={key} value={key} className="outline-none">
            {list.length === 0 ? (
              <PageEmpty
                title={t("empty")}
                description={t("emptyHint")}
                compact
                action={
                  <Link
                    href={routes.sessionsNew}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "rounded-xl",
                    )}
                  >
                    {t("create")}
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {list.map((s) => (
                  <li key={s.id}>
                    <SessionRow session={s} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
