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
    <div className="page-shell gap-6 md:gap-7">
      <header className="space-y-1 md:space-y-1.5">
        <p className="text-xs font-medium tracking-wide text-primary uppercase md:text-[0.8125rem]">
          {t("profile.badge")}
        </p>
        <h1 className="page-title">{t("profile.title")}</h1>
        <p className="page-subtitle">{t("profile.subtitle")}</p>
      </header>

      <div className="page-grid-2 items-start">
      <DrunkProfileCard user={user} isOwner />

      <ul className="overflow-hidden rounded-2xl border border-border bg-card md:shadow-sm lg:self-start">
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
                    ? "flex min-h-14 items-center gap-3 border-t border-border px-4 py-3 transition-colors active:bg-muted md:min-h-[3.75rem] md:px-5 md:py-3.5"
                    : "flex min-h-14 items-center gap-3 px-4 py-3 transition-colors active:bg-muted md:min-h-[3.75rem] md:px-5 md:py-3.5"
                }
              >
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="flex-1 text-sm font-medium md:text-[0.9375rem]">
                  {label}
                </span>
                <ChevronRightIcon
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
      </div>

      {footer}
    </div>
  );
}
