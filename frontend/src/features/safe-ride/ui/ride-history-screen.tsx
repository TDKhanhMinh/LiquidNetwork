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
import { useRideHistory } from "../hook/use-safe-ride";

export function RideHistoryScreen() {
  const { t, ready } = useAppTranslation(["safe-ride", "common"]);
  const { data, isLoading, isError, refetch } = useRideHistory();

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

  const rides = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("history.title")}
        </h1>
      </header>

      {rides.length === 0 ? (
        <PageEmpty
          title={t("history.empty")}
          description={t("history.emptyHint")}
          compact
        />
      ) : (
        <ul className="space-y-2">
          {rides.map((ride) => {
            const labelKey =
              ride.provider === "xanh_sm"
                ? "xanhSm"
                : ride.provider === "buddy_drive"
                  ? "buddyDrive"
                  : ride.provider;
            return (
              <li
                key={ride.id}
                className="rounded-xl border border-border bg-card px-3 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{t(`ride.${labelKey}`)}</p>
                  <Badge variant="outline">
                    {t(`history.status.${ride.status}`)}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ride.fromLabel}
                  {ride.toLabel ? ` → ${ride.toLabel}` : ""}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(ride.createdAt).toLocaleString()}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href={routes.safeRide}
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
