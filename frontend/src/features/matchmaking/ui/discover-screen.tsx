"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  FilterIcon,
  MapPinIcon,
} from "lucide-react";
import {
  DEFAULT_FILTERS,
  MATCH_MODES,
  type AlcoholLevelFilter,
  type MatchFilters,
} from "@/entities/matchmaking";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useMatchSearch } from "../hook/use-match-search";

const LEVELS: AlcoholLevelFilter[] = [
  "any",
  "LEVEL_1",
  "LEVEL_2",
  "LEVEL_3",
  "LEVEL_4",
];

export function DiscoverScreen() {
  const { t, ready } = useAppTranslation(["matchmaking", "common", "user"]);
  const [filters, setFilters] = useState<MatchFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } =
    useMatchSearch(filters);

  const fightMode = filters.mode === "fight";
  const items = data?.items ?? [];

  if (!ready) return null;

  return (
    <div className="page-shell gap-4 md:gap-5">
      <header className="flex items-start justify-between gap-3 md:gap-4">
        <div className="space-y-1 md:space-y-1.5">
          <h1 className="page-title">{t("title")}</h1>
          <p className="page-subtitle">{t("subtitle")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 shrink-0 rounded-xl md:size-12"
          aria-expanded={showFilters}
          aria-label={t("filters.title")}
          onClick={() => setShowFilters((v) => !v)}
        >
          <FilterIcon />
        </Button>
      </header>

      <section className="space-y-2 md:space-y-2.5">
        <h2 className="page-section-title">{t("filters.mode")}</h2>
        <div className="grid grid-cols-2 gap-2 md:gap-3 lg:max-w-xl">
          {MATCH_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, mode }))}
              className={cn(
                "min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors md:min-h-[3.25rem] md:text-[0.9375rem] hover:border-primary/40",
                filters.mode === mode
                  ? "border-primary bg-primary/15 text-primary shadow-amber-glow"
                  : "border-border bg-card text-foreground",
              )}
            >
              {t(`modes.${mode}`)}
            </button>
          ))}
        </div>
        {fightMode ? (
          <div
            role="alert"
            className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-3 text-sm text-warning"
          >
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
            <p>{t("modes.fightDisclaimer")}</p>
          </div>
        ) : null}
      </section>

      {showFilters ? (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">{t("filters.title")}</h2>
          <div className="flex flex-col gap-2">
            <Label>{t("filters.level")}</Label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, level: lv }))}
                  className={cn(
                    "min-h-10 rounded-xl border px-3 text-xs font-medium",
                    filters.level === lv
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground",
                  )}
                >
                  {lv === "any"
                    ? t("filters.anyLevel")
                    : t(`user:level.labels.${lv}`, { defaultValue: lv })}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dist">
              {t("filters.distance")}: {filters.maxDistanceKm} km
            </Label>
            <input
              id="dist"
              type="range"
              min={1}
              max={30}
              value={filters.maxDistanceKm}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  maxDistanceKm: Number(e.target.value),
                }))
              }
              className="w-full accent-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="occ">{t("filters.occupation")}</Label>
            <Input
              id="occ"
              value={filters.occupation ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, occupation: e.target.value }))
              }
              placeholder={t("filters.occupationPlaceholder")}
              className="h-11 rounded-xl"
            />
          </div>
        </section>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {t("results.title")}
          {data ? ` · ${data.total}` : ""}
        </h2>
        {isFetching ? (
          <span className="text-xs text-muted-foreground">
            {t("common:actions.loading")}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <PageLoading compact />
      ) : isError ? (
        <PageErrorInline
          compact
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <PageEmpty
          title={t("results.empty")}
          description={t("results.emptyHint")}
          compact
        />
      ) : (
        <ul className="grid grid-cols-1 gap-2 pb-2 md:gap-3 lg:grid-cols-2">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={routes.userPublic(c.id)}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 transition-colors hover:border-primary/30 hover:bg-muted/30 active:bg-muted md:min-h-[4.5rem] md:px-4"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary md:size-14">
                  {c.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <Badge variant="secondary" className="shrink-0">
                      {c.matchScore}%
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {[c.occupation, c.alcoholToleranceLevel]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPinIcon className="size-3" />
                    {c.distanceKm.toFixed(1)} km
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-2 pb-2">
        <Link
          href={routes.sessionsNew}
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-h-11 rounded-xl",
          )}
        >
          {t("cta.createSession")}
        </Link>
        <Link
          href={routes.safeRide}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 rounded-xl",
          )}
        >
          {t("cta.safeRide")}
        </Link>
      </div>
    </div>
  );
}
