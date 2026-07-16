"use client";

import Link from "next/link";
import {
  HistoryIcon,
  PlusIcon,
  RadioIcon,
} from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { PageEmpty, PageErrorInline, PageLoading } from "@/widgets/page-state";
import { useMyInvitationQueue } from "../hook/use-my-invitation-queue";
import { useCountdown } from "../hook/use-countdown";

export function QueueHub() {
  const { t, ready } = useAppTranslation(["invitation-queue", "common"]);
  const { data: active, isLoading, isError, refetch } =
    useMyInvitationQueue();
  const current = active?.participants[active.currentIndex];
  const { label } = useCountdown(
    active?.status === "active" ? active.expiresAt : null,
  );

  if (!ready || isLoading) return <PageLoading compact />;
  if (isError) {
    return (
      <PageErrorInline
        compact
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
      <header className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mb-6 flex gap-2">
        <Link
          href={routes.queueNew}
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-h-11 flex-1 rounded-xl",
          )}
        >
          <PlusIcon />
          {t("hub.create")}
        </Link>
        <Link
          href={routes.queueHistory}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 flex-1 rounded-xl",
          )}
        >
          <HistoryIcon />
          {t("hub.history")}
        </Link>
      </div>

      {active && active.status === "active" ? (
        <Link
          href={routes.queueLive(active.id)}
          className="mb-4 block rounded-2xl border border-primary/40 bg-primary/10 p-4 shadow-amber-glow ring-1 ring-primary/20 transition-colors active:bg-primary/15"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="gap-1">
                <RadioIcon className="size-3 animate-pulse" />
                {t("hub.active")}
              </Badge>
            </div>
            <span className="font-mono text-sm font-semibold text-primary">
              {label}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium">
            {t("live.currentInvitee")}: {current?.name ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {active.title}
          </p>
        </Link>
      ) : (
        <PageEmpty
          title={t("hub.emptyTitle")}
          description={t("hub.emptyDescription")}
          compact
          action={
            <Link
              href={routes.queueNew}
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-xl",
              )}
            >
              {t("hub.create")}
            </Link>
          }
        />
      )}
    </div>
  );
}
