"use client";

import Link from "next/link";
import {
  BellIcon,
  ChevronRightIcon,
  CreditCardIcon,
  CrownIcon,
  FlagIcon,
  LifeBuoyIcon,
  ShieldIcon,
  TicketIcon,
  UserRoundIcon,
} from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  changeAppLanguage,
  type AppLanguage,
} from "@/shared/i18n";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";

export function SettingsHubScreen() {
  const { t, ready, i18n } = useAppTranslation([
    "common",
    "monetization",
    "support",
  ]);
  if (!ready) return null;

  const active = (i18n.language?.split("-")[0] ?? "vi") as AppLanguage;

  const groups = [
    {
      title: t("settingsHub.account"),
      items: [
        {
          href: routes.settingsAccount,
          icon: UserRoundIcon,
          label: t("settingsHub.accountPrivacy"),
        },
        {
          href: routes.notificationSettings,
          icon: BellIcon,
          label: t("settingsHub.notifications"),
        },
        {
          href: routes.safeRideSettings,
          icon: ShieldIcon,
          label: t("settingsHub.safeRide"),
        },
      ],
    },
    {
      title: t("settingsHub.monetization"),
      items: [
        {
          href: routes.premium,
          icon: CrownIcon,
          label: t("monetization:premium.title"),
        },
        {
          href: routes.vouchers,
          icon: TicketIcon,
          label: t("monetization:vouchers.title"),
        },
        {
          href: routes.payments,
          icon: CreditCardIcon,
          label: t("monetization:payments.title"),
        },
        {
          href: routes.bookings,
          icon: TicketIcon,
          label: t("monetization:bookings.title"),
        },
      ],
    },
    {
      title: t("settingsHub.support"),
      items: [
        {
          href: routes.support,
          icon: LifeBuoyIcon,
          label: t("support:title"),
        },
        {
          href: routes.supportReport,
          icon: FlagIcon,
          label: t("support:hub.report"),
        },
      ],
    },
  ];

  return (
    <div className="page-shell gap-6 md:gap-7">
      <header className="space-y-1">
        <h1 className="page-title">
          {t("settingsHub.title")}
        </h1>
        <p className="page-subtitle">
          {t("settingsHub.subtitle")}
        </p>
      </header>

      <section className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{t("language.label")}</p>
          <p className="text-xs text-muted-foreground">
            {t("settingsHub.languageHint")}
          </p>
        </div>
        <div className="flex items-center gap-1" role="group">
          {SUPPORTED_LANGUAGES.map((lng) => (
            <Button
              key={lng}
              type="button"
              size="xs"
              variant={active === lng ? "default" : "ghost"}
              onClick={() => {
                void changeAppLanguage(lng);
              }}
            >
              {t(`language.${lng}`)}
            </Button>
          ))}
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.title}
          </h2>
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {group.items.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    i > 0
                      ? "flex min-h-14 items-center gap-3 border-t border-border px-4 py-3 active:bg-muted"
                      : "flex min-h-14 items-center gap-3 px-4 py-3 active:bg-muted"
                  }
                >
                  <item.icon className="size-5 text-primary" />
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
