"use client";

import type { User } from "@/entities/user";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

interface ProfileStatsProps {
  user: User;
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const { t } = useAppTranslation("user");

  const items = [
    {
      label: t("stats.sessions"),
      value: String(user.sessionsJoined ?? 0),
    },
    {
      label: t("stats.acceptRate"),
      value: `${user.invitationAcceptRate ?? 0}%`,
    },
    {
      label: t("stats.rating"),
      value:
        user.averageRating != null
          ? user.averageRating.toFixed(1)
          : "—",
    },
    {
      label: t("stats.reviews"),
      value: String(user.totalReviews ?? 0),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card px-3 py-3 text-center"
        >
          <p className="text-lg font-bold text-primary">{item.value}</p>
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
