"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useSessionsList } from "../hook/use-sessions";

export function SessionHistoryScreen() {
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

  const history = (data ?? []).filter(
    (s) => s.status === "ended" || s.status === "cancelled",
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("history.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("history.subtitle")}
        </p>
      </header>

      {history.length === 0 ? (
        <PageEmpty title={t("history.empty")} compact />
      ) : (
        <ul className="space-y-2">
          {history.map((s) => (
            <li key={s.id}>
              <Link
                href={routes.sessionDetail(s.id)}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.startTime).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{t(`status.${s.status}`)}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={routes.sessions}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "min-h-11 rounded-xl",
        )}
      >
        {t("common:actions.back")}
      </Link>
    </div>
  );
}
