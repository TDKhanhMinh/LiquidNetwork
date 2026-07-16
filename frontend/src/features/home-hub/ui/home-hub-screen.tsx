"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  CarIcon,
  CompassIcon,
  CrownIcon,
  ListOrderedIcon,
  SearchIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { invitationQueueApi, invitationQueueKeys } from "@/entities/invitation-queue";
import { drinkingSessionApi, drinkingSessionKeys } from "@/entities/drinking-session";
import { friendsApi, friendsKeys } from "@/entities/friends";
import { monetizationApi, monetizationKeys } from "@/entities/monetization";
import { getAccessToken } from "@/shared/api";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { PageLoading } from "@/widgets/page-state";

export function HomeHubScreen() {
  const { t, ready } = useAppTranslation(["common", "friends", "monetization"]);
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setIsAuthenticated(Boolean(getAccessToken()));
  }, []);

  const queue = useQuery({
    queryKey: invitationQueueKeys.me(),
    queryFn: () => invitationQueueApi.getMyQueue(),
    enabled: isAuthenticated,
  });
  const sessions = useQuery({
    queryKey: drinkingSessionKeys.list(),
    queryFn: () => drinkingSessionApi.list(),
    enabled: isAuthenticated,
  });
  const friends = useQuery({
    queryKey: friendsKeys.list("all"),
    queryFn: () => friendsApi.list("all"),
    enabled: isAuthenticated,
  });
  const ads = useQuery({
    queryKey: monetizationKeys.ads("home"),
    queryFn: () => monetizationApi.listAds("home"),
    enabled: isAuthenticated,
  });

  if (!hydrated || !ready) return <PageLoading compact />;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            {t("tagline")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("appName")}
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            {t("home.subtitle")}
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={routes.login}
            className={cn(
              buttonVariants({ variant: "default" }),
              "min-h-11 w-full rounded-xl sm:w-auto",
            )}
          >
            {t("home.ctaLogin")}
          </Link>
          <Link
            href={routes.register}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "min-h-11 w-full rounded-xl sm:w-auto",
            )}
          >
            {t("home.ctaRegister")}
          </Link>
        </div>
      </div>
    );
  }

  const activeQueue = queue.data?.status === "active" ? queue.data : null;
  const upcomingSessions = (sessions.data ?? [])
    .filter((s) => s.status === "scheduled" || s.status === "live")
    .slice(0, 3);
  const buddyPreview = (friends.data ?? []).slice(0, 4);
  const promo = ads.data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <header className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {t("tagline")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("home.welcome")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
        </div>
        <Link
          href={routes.search}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors active:bg-muted"
        >
          <SearchIcon className="size-4" />
          {t("home.searchPlaceholder")}
        </Link>
      </header>

      {activeQueue ? (
        <Link
          href={routes.queueLive(activeQueue.id)}
          className="block rounded-2xl border border-primary/40 bg-primary/10 p-4 shadow-amber-glow ring-1 ring-primary/20"
        >
          <div className="flex items-center justify-between gap-2">
            <Badge className="gap-1">{t("home.activeQueue")}</Badge>
            <span className="text-xs text-primary">
              {activeQueue.participants[activeQueue.currentIndex]?.name}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium">{activeQueue.title}</p>
        </Link>
      ) : null}

      {promo.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">{t("home.forYou")}</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {promo.map((ad) => (
              <Link
                key={ad.id}
                href={ad.href}
                className="min-w-[240px] shrink-0 rounded-2xl border border-border bg-card p-4 ring-1 ring-primary/10"
              >
                <p className="text-sm font-semibold">{ad.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{ad.body}</p>
                <span className="mt-3 inline-flex text-xs font-semibold text-primary">
                  {ad.ctaLabel} →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">{t("home.quickActions")}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                href: routes.queueNew,
                icon: ListOrderedIcon,
                label: t("home.createQueue"),
                tone: "bg-primary/15 text-primary",
              },
              {
                href: routes.discover,
                icon: CompassIcon,
                label: t("home.discover"),
                tone: "bg-secondary/40 text-secondary-foreground",
              },
              {
                href: routes.sessions,
                icon: CalendarIcon,
                label: t("home.sessions"),
                tone: "bg-success/15 text-success",
              },
              {
                href: routes.safeRide,
                icon: CarIcon,
                label: t("home.safeRide"),
                tone: "bg-warning/15 text-warning",
              },
              {
                href: routes.friends,
                icon: UsersIcon,
                label: t("home.friends"),
                tone: "bg-accent/20 text-accent",
              },
              {
                href: routes.premium,
                icon: CrownIcon,
                label: t("home.premium"),
                tone: "bg-primary/20 text-primary",
              },
              {
                href: routes.vouchers,
                icon: TicketIcon,
                label: t("home.vouchers"),
                tone: "bg-muted text-foreground",
              },
              {
                href: routes.bookings,
                icon: CalendarIcon,
                label: t("home.bookings"),
                tone: "bg-secondary/30 text-foreground",
              },
            ] as const
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 active:bg-muted"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  item.tone,
                )}
              >
                <item.icon className="size-5" />
              </span>
              <span className="text-sm font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("home.upcomingSessions")}</h2>
          <Link
            href={routes.sessions}
            className="text-xs font-medium text-primary"
          >
            {t("actions.viewAll")}
          </Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
            {t("home.noSessions")}
          </p>
        ) : (
          <ul className="space-y-2">
            {upcomingSessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={routes.sessionDetail(s.id)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.startTime).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{s.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("home.drinkingBuddies")}</h2>
          <Link
            href={routes.friends}
            className="text-xs font-medium text-primary"
          >
            {t("actions.viewAll")}
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {buddyPreview.map((f) => (
            <Link
              key={f.id}
              href={routes.userPublic(f.id)}
              className="flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-1 py-2"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-sm font-bold text-primary">
                {f.name.slice(0, 1)}
              </span>
              <span className="max-w-[72px] truncate text-[11px] font-medium">
                {f.name.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
