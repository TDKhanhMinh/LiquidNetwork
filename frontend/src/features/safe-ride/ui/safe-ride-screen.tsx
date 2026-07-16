"use client";

import Link from "next/link";
import {
  AlertTriangleIcon,
  CarIcon,
  HistoryIcon,
  Loader2Icon,
  SettingsIcon,
  ShieldAlertIcon,
} from "lucide-react";
import type { RideProvider } from "@/entities/safe-ride";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import {
  openProvider,
  useFines,
  useRequestRide,
  useRidePrefs,
} from "../hook/use-safe-ride";

const PROVIDERS: RideProvider[] = [
  "xanh_sm",
  "grab",
  "gojek",
  "buddy_drive",
];

export function SafeRideScreen() {
  const { t, ready } = useAppTranslation(["safe-ride", "common"]);
  const fines = useFines();
  const prefs = useRidePrefs();
  const requestRide = useRequestRide();

  if (!ready || fines.isLoading || prefs.isLoading) return <PageLoading />;
  if (fines.isError) {
    return (
      <PageErrorInline
        onRetry={() => {
          void fines.refetch();
        }}
      />
    );
  }

  const preferred = prefs.data?.preferredProvider ?? "grab";

  async function handleRide(provider: RideProvider) {
    await requestRide.mutateAsync({ provider });
    openProvider(provider);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      {/* Warning */}
      <section
        role="alert"
        className="flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4"
      >
        <ShieldAlertIcon className="mt-0.5 size-6 shrink-0 text-destructive" />
        <div>
          <h2 className="font-semibold text-destructive">
            {t("warning.title")}
          </h2>
          <p className="mt-1 text-sm text-destructive/90">
            {t("warning.description")}
          </p>
        </div>
      </section>

      {/* Quick ride */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("ride.title")}</h2>
          <Badge variant="secondary">
            {preferred === "xanh_sm"
              ? t("ride.xanhSm")
              : preferred === "buddy_drive"
                ? t("ride.buddyDrive")
                : preferred === "gojek"
                  ? t("ride.gojek")
                  : t("ride.grab")}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map((p) => {
            const labelKey =
              p === "xanh_sm"
                ? "xanhSm"
                : p === "buddy_drive"
                  ? "buddyDrive"
                  : p;
            const isPreferred = p === preferred;
            return (
              <Button
                key={p}
                type="button"
                variant={isPreferred ? "default" : "outline"}
                className={cn(
                  "min-h-14 flex-col gap-1 rounded-xl",
                  isPreferred && "shadow-amber-glow",
                )}
                disabled={requestRide.isPending}
                onClick={() => handleRide(p)}
              >
                {requestRide.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <CarIcon className="size-5" />
                )}
                <span className="text-xs font-medium">
                  {t(`ride.${labelKey}`)}
                </span>
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{t("ride.hint")}</p>
      </section>

      {/* Decree 100 fines */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="size-4 text-warning" />
          <h2 className="text-sm font-semibold">{t("fines.title")}</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("fines.description")}
        </p>
        <p className="text-[11px] text-muted-foreground italic">
          {t("fines.disclaimer")}
        </p>
        <ul className="space-y-2">
          {(fines.data ?? []).map((band) => (
            <li
              key={band.id}
              className="rounded-xl border border-border bg-card px-3 py-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">{band.vehicle}</Badge>
                <span className="font-semibold text-primary">
                  {band.fineRange}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {band.bloodAlcohol}
              </p>
              <p className="mt-1 text-xs font-medium">{band.licenseAction}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={routes.safeRideHistory}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 rounded-xl",
          )}
        >
          <HistoryIcon />
          {t("history.title")}
        </Link>
        <Link
          href={routes.safeRideSettings}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 rounded-xl",
          )}
        >
          <SettingsIcon />
          {t("settings.title")}
        </Link>
      </div>
    </div>
  );
}
