"use client";

import { useState } from "react";
import Link from "next/link";
import type { FriendRelation } from "@/entities/friends";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useFriends } from "../hook/use-friends";

const FILTERS: Array<FriendRelation | "all"> = [
  "all",
  "friend",
  "drinking_buddy",
  "both",
];

export function FriendsScreen() {
  const { t, ready } = useAppTranslation(["friends", "common"]);
  const [filter, setFilter] = useState<FriendRelation | "all">("all");
  const { data, isLoading, isError, refetch } = useFriends(filter);

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

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium",
              filter === f
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {t(`filters.${f}`)}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <PageEmpty title={t("empty")} description={t("emptyHint")} compact />
      ) : (
        <ul className="space-y-2">
          {items.map((f) => (
            <li key={f.id}>
              <Link
                href={routes.userPublic(f.id)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 active:bg-muted"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-sm font-bold text-primary">
                  {f.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{f.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[f.occupation, f.alcoholToleranceLevel]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {t("sessionsTogether", { count: f.sessionsTogether })}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {t(`relation.${f.relation}`)}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
