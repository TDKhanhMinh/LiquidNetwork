"use client";

import { Loader2Icon } from "lucide-react";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useRedeemVoucher, useVouchers } from "../hook/use-monetization";

export function VouchersScreen() {
  const { t, ready } = useAppTranslation("monetization");
  const { data, isLoading, isError, refetch } = useVouchers();
  const redeem = useRedeemVoucher();

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
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("vouchers.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("vouchers.subtitle")}
        </p>
      </header>

      {items.length === 0 ? (
        <PageEmpty title={t("vouchers.empty")} compact />
      ) : (
        <ul className="space-y-2">
          {items.map((v) => (
            <li
              key={v.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{v.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {v.description}
                  </p>
                  <p className="mt-1 font-mono text-xs text-primary">
                    {v.code}
                  </p>
                </div>
                <Badge variant={v.used ? "outline" : "default"}>
                  {v.discountLabel}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  {t("vouchers.expires", {
                    date: new Date(v.expiresAt).toLocaleDateString(),
                  })}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl"
                  disabled={v.used || redeem.isPending}
                  onClick={() => redeem.mutate(v.id)}
                >
                  {redeem.isPending ? (
                    <Loader2Icon className="animate-spin" />
                  ) : null}
                  {v.used ? t("vouchers.used") : t("vouchers.redeem")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
