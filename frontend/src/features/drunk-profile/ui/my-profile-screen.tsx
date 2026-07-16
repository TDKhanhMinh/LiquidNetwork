"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  BellIcon,
  ChevronRightIcon,
  SettingsIcon,
  StarIcon,
  UserPenIcon,
} from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useMyProfile } from "../hook/use-my-profile";
import { DrunkProfileCard } from "./drunk-profile-card";

const LINKS = [
  {
    href: routes.profileEdit,
    labelKey: "profile.edit" as const,
    icon: UserPenIcon,
  },
  {
    href: routes.profileLevel,
    labelKey: "profile.level" as const,
    icon: StarIcon,
  },
  {
    href: routes.profileReviews,
    labelKey: "profile.reviews" as const,
    icon: StarIcon,
  },
  {
    href: routes.settings,
    labelKey: "profile.settings" as const,
    icon: SettingsIcon,
  },
  {
    href: routes.notifications,
    labelKey: "nav.notifications" as const,
    icon: BellIcon,
    ns: "common" as const,
  },
];

interface MyProfileScreenProps {
  /** Composed from app layer (e.g. LogoutButton) — FSD: no feature→feature imports */
  footer?: ReactNode;
}

export function MyProfileScreen({ footer }: MyProfileScreenProps) {
  const { t, ready } = useAppTranslation(["user", "common", "auth"]);
  const { data: user, isLoading, isError, refetch } = useMyProfile();

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !user) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          {t("profile.badge")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </header>

      <DrunkProfileCard user={user} isOwner />

      <ul className="overflow-hidden rounded-2xl border border-border bg-card">
        {LINKS.map((item, index) => {
          const Icon = item.icon;
          const label =
            "ns" in item && item.ns === "common"
              ? t(`common:${item.labelKey}`)
              : t(item.labelKey);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  index > 0
                    ? "flex min-h-14 items-center gap-3 border-t border-border px-4 py-3 transition-colors active:bg-muted"
                    : "flex min-h-14 items-center gap-3 px-4 py-3 transition-colors active:bg-muted"
                }
              >
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRightIcon
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>

      {footer}
    </div>
  );
}
