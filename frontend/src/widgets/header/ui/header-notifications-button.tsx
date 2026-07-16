"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BellIcon } from "lucide-react";
import { notificationApi, notificationKeys } from "@/entities/notification";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function HeaderNotificationsButton() {
  const { t } = useAppTranslation("common");
  const { data: unread = 0 } = useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationApi.unreadCount(),
    refetchInterval: 15_000,
  });

  return (
    <Link
      href={routes.notifications}
      className="relative inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={t("nav.notifications")}
    >
      <BellIcon className="size-5" aria-hidden />
      {unread > 0 ? (
        <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
