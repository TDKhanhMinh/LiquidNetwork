"use client";

import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Badge } from "@/shared/ui/badge";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { usePayments } from "../hook/use-monetization";

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

export function PaymentsScreen() {
  const { t, ready } = useAppTranslation("monetization");
  const { data, isLoading, isError, refetch } = usePayments();

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
    <div className="page-shell gap-4 md:gap-5">
      <header className="space-y-1">
        <h1 className="page-title">
          {t("payments.title")}
        </h1>
        <p className="page-subtitle">
          {t("payments.subtitle")}
        </p>
      </header>

      {items.length === 0 ? (
        <PageEmpty title={t("payments.empty")} compact />
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.method} · {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">
                  {formatVnd(p.amount)}
                </p>
                <Badge variant="outline" className="text-[10px]">
                  {t(`payments.status.${p.status}`)}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
