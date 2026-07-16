"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import {
  ALCOHOL_TOLERANCE_LEVELS,
  type AlcoholToleranceLevel,
  userApi,
  userKeys,
} from "@/entities/user";
import { peerReviewApi } from "@/entities/peer-review";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useMyProfile } from "../hook/use-my-profile";
import { LevelBadge } from "./level-badge";

export function LevelScreen() {
  const { t, ready } = useAppTranslation(["user", "error", "common"]);
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError, refetch } = useMyProfile();
  const [selected, setSelected] = useState<AlcoholToleranceLevel | null>(null);

  const history = useQuery({
    queryKey: [...userKeys.me(), "level-history"],
    queryFn: () =>
      peerReviewApi.levelHistory(
        user?.id ?? "me",
        user?.alcoholToleranceLevel as string | undefined,
      ),
    enabled: Boolean(user?.id),
  });

  const updateLevel = useMutation({
    mutationFn: (level: AlcoholToleranceLevel) =>
      userApi.updateToleranceLevel({ level }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err) => notifyError(err, t),
  });

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !user) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const current = (selected ??
    user.alcoholToleranceLevel ??
    "LEVEL_2") as AlcoholToleranceLevel;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("level.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("level.subtitle")}</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 text-center ring-1 ring-primary/10">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          {t("level.current")}
        </p>
        <div className="mt-3 flex justify-center">
          <LevelBadge level={user.alcoholToleranceLevel} showHint />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{t("level.change")}</h2>
        <div className="grid gap-2">
          {ALCOHOL_TOLERANCE_LEVELS.map((lv) => {
            const active = current === lv;
            return (
              <button
                key={lv}
                type="button"
                onClick={() => setSelected(lv)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <p className="text-sm font-semibold">
                  {t(`level.labels.${lv}`)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(`level.hints.${lv}`)}
                </p>
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          className="mt-2 min-h-11 w-full rounded-xl"
          disabled={
            updateLevel.isPending ||
            current === user.alcoholToleranceLevel
          }
          onClick={() => updateLevel.mutate(current)}
        >
          {updateLevel.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          {t("level.save")}
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{t("level.historyTitle")}</h2>
        {history.isLoading ? (
          <p className="text-sm text-muted-foreground">
            {t("common:actions.loading")}
          </p>
        ) : (
          <ul className="space-y-2">
            {(history.data ?? []).map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {t(`level.labels.${entry.level}`, {
                      defaultValue: entry.level,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.note || entry.source}
                  </p>
                </div>
                <time className="shrink-0 text-[11px] text-muted-foreground">
                  {entry.createdAt
                    ? new Date(entry.createdAt).toLocaleDateString()
                    : ""}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
