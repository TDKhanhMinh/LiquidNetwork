"use client";

import { CarIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Badge } from "@/shared/ui/badge";

/**
 * Default interstitial creative for the Safe Ride entry gate.
 * Centered card content (parent InterstitialAd owns max-width).
 */
export function SafeRideAdCreative() {
  const { t, ready } = useAppTranslation("safe-ride");

  if (!ready) {
    return (
      <div
        className="flex min-h-48 items-center justify-center text-sm text-muted-foreground"
        aria-hidden
      >
        …
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 text-center sm:gap-6">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-amber-glow sm:size-[4.5rem]">
        <CarIcon className="size-8 sm:size-9" aria-hidden />
      </div>

      <div className="space-y-2 sm:space-y-2.5">
        <Badge
          variant="secondary"
          className="mx-auto gap-1 border border-primary/25 bg-primary/10 text-primary"
        >
          <SparklesIcon className="size-3" aria-hidden />
          {t("ad.badge")}
        </Badge>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-[1.75rem]">
          {t("ad.title")}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("ad.description")}
        </p>
      </div>

      <ul className="space-y-2 text-left text-sm sm:space-y-2.5 sm:text-[0.9375rem]">
        {(["item1", "item2", "item3"] as const).map((key) => (
          <li
            key={key}
            className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-muted/40 px-3 py-2.5 sm:px-4 sm:py-3"
          >
            <ShieldCheckIcon
              className="mt-0.5 size-4 shrink-0 text-success sm:size-[1.1rem]"
              aria-hidden
            />
            <span className="text-foreground/90">{t(`ad.${key}`)}</span>
          </li>
        ))}
      </ul>

      <p className="text-[11px] text-muted-foreground italic sm:text-xs">
        {t("ad.note")}
      </p>
    </div>
  );
}
