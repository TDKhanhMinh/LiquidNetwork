"use client";

import Link from "next/link";
import type { RideProvider } from "@/entities/safe-ride";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import {
  useRidePrefs,
  useUpdateRidePrefs,
} from "../hook/use-safe-ride";

const PROVIDERS: RideProvider[] = [
  "xanh_sm",
  "grab",
  "gojek",
  "buddy_drive",
];

export function SafeRideSettingsScreen() {
  const { t, ready } = useAppTranslation(["safe-ride", "common"]);
  const prefs = useRidePrefs();
  const update = useUpdateRidePrefs();

  if (!ready || prefs.isLoading) return <PageLoading />;
  if (prefs.isError || !prefs.data) {
    return (
      <PageErrorInline
        onRetry={() => {
          void prefs.refetch();
        }}
      />
    );
  }

  const preferred = prefs.data.preferredProvider;

  return (
    <div className="page-shell gap-5 md:gap-6">
      <header className="space-y-1">
        <h1 className="page-title">
          {t("settings.title")}
        </h1>
        <p className="page-subtitle">
          {t("settings.preferredProvider")}
        </p>
      </header>

      <div className="grid gap-2">
        {PROVIDERS.map((p) => {
          const labelKey =
            p === "xanh_sm"
              ? "xanhSm"
              : p === "buddy_drive"
                ? "buddyDrive"
                : p;
          const active = preferred === p;
          return (
            <button
              key={p}
              type="button"
              disabled={update.isPending}
              onClick={() => update.mutate({ preferredProvider: p })}
              className={cn(
                "min-h-12 rounded-xl border px-4 text-left text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card",
              )}
            >
              {t(`ride.${labelKey}`)}
            </button>
          );
        })}
      </div>

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
