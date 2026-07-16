"use client";

import { Loader2Icon } from "lucide-react";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { usePremiumPlans, useSubscribe } from "../hook/use-monetization";

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

export function PremiumScreen() {
  const { t, ready } = useAppTranslation("monetization");
  const { data, isLoading, isError, refetch } = usePremiumPlans();
  const subscribe = useSubscribe();

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !data) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("premium.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("premium.subtitle")}
        </p>
      </header>

      <div className="grid gap-3">
        {data.plans.map((plan) => {
          const current = data.currentPlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-2xl border p-4",
                plan.highlighted
                  ? "border-primary bg-primary/10 shadow-amber-glow ring-1 ring-primary/20"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{plan.name}</h2>
                    {plan.highlighted ? (
                      <Badge>{t("premium.popular")}</Badge>
                    ) : null}
                    {current ? (
                      <Badge variant="secondary">{t("premium.current")}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.priceMonthly === 0
                      ? t("premium.free")
                      : t("premium.perMonth", {
                          price: formatVnd(plan.priceMonthly),
                        })}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <Button
                type="button"
                className="mt-4 min-h-11 w-full rounded-xl"
                variant={plan.highlighted ? "default" : "outline"}
                disabled={current || subscribe.isPending || plan.id === "free"}
                onClick={() => subscribe.mutate(plan.id)}
              >
                {subscribe.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : null}
                {current
                  ? t("premium.current")
                  : plan.id === "free"
                    ? t("premium.free")
                    : t("premium.subscribe")}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
