"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
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
import { useBookings } from "../hook/use-monetization";

export function BookingsScreen() {
  const { t, ready } = useAppTranslation("monetization");
  const { data, isLoading, isError, refetch } = useBookings();

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
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("bookings.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("bookings.subtitle")}
          </p>
        </div>
        <Link
          href={routes.bookingNew}
          className={cn(
            buttonVariants({ variant: "default", size: "icon" }),
            "size-11 rounded-xl",
          )}
          aria-label={t("bookings.create")}
        >
          <PlusIcon />
        </Link>
      </header>

      {items.length === 0 ? (
        <PageEmpty
          title={t("bookings.empty")}
          description={t("bookings.emptyHint")}
          compact
          action={
            <Link
              href={routes.bookingNew}
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-xl",
              )}
            >
              {t("bookings.create")}
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {items.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-border bg-card px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{b.venueName}</p>
                  <p className="text-xs text-muted-foreground">{b.address}</p>
                </div>
                <Badge variant="outline">
                  {t(`bookings.status.${b.status}`)}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(b.reservedAt).toLocaleString()} · {b.partySize}{" "}
                {t("bookings.people")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
