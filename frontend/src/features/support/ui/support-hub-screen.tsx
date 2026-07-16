"use client";

import Link from "next/link";
import {
  BookOpenIcon,
  ChevronRightIcon,
  FlagIcon,
  LifeBuoyIcon,
} from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function SupportHubScreen() {
  const { t, ready } = useAppTranslation("support");
  if (!ready) return null;

  const links = [
    {
      href: routes.supportFaq,
      icon: BookOpenIcon,
      title: t("hub.faq"),
      desc: t("hub.faqDesc"),
    },
    {
      href: routes.supportReport,
      icon: FlagIcon,
      title: t("hub.report"),
      desc: t("hub.reportDesc"),
    },
  ];

  return (
    <div className="page-shell gap-5 md:gap-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <LifeBuoyIcon className="size-5" />
          <p className="text-xs font-medium tracking-wide uppercase">
            {t("hub.badge")}
          </p>
        </div>
        <h1 className="page-title">{t("title")}</h1>
        <p className="page-subtitle">{t("subtitle")}</p>
      </header>

      <ul className="overflow-hidden rounded-2xl border border-border bg-card">
        {links.map((item, i) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                i > 0
                  ? "flex min-h-16 items-center gap-3 border-t border-border px-4 py-3 active:bg-muted"
                  : "flex min-h-16 items-center gap-3 px-4 py-3 active:bg-muted"
              }
            >
              <item.icon className="size-5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
