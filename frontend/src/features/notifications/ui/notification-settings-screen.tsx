"use client";

import Link from "next/link";
import type { NotificationCategory } from "@/entities/notification";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
} from "../hook/use-notifications";

const CATEGORY_KEYS: NotificationCategory[] = [
  "queue",
  "session",
  "review",
  "chat",
  "system",
];

export function NotificationSettingsScreen() {
  const { t, ready } = useAppTranslation(["notification", "common"]);
  const prefs = useNotificationPrefs();
  const update = useUpdateNotificationPrefs();

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

  const data = prefs.data;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">{t("settings.channels")}</h2>
        {(
          [
            ["push", data.push],
            ["email", data.email],
            ["inApp", data.inApp],
          ] as const
        ).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <Label htmlFor={`ch-${key}`}>{t(`settings.${key}`)}</Label>
            <Switch
              id={`ch-${key}`}
              checked={value}
              disabled={update.isPending}
              onCheckedChange={(checked) =>
                update.mutate({ [key]: checked })
              }
            />
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">{t("settings.byCategory")}</h2>
        {CATEGORY_KEYS.map((cat) => (
          <div key={cat} className="flex items-center justify-between gap-3">
            <Label htmlFor={`cat-${cat}`}>{t(`categories.${cat}`)}</Label>
            <Switch
              id={`cat-${cat}`}
              checked={data.categories[cat]}
              disabled={update.isPending}
              onCheckedChange={(checked) =>
                update.mutate({
                  categories: { ...data.categories, [cat]: checked },
                })
              }
            />
          </div>
        ))}
      </section>

      <Link
        href={routes.notifications}
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
