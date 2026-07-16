"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { chatApi, chatKeys } from "@/entities/chat";
import { MAIN_TABS, isTabActive } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { cn } from "@/shared/lib/utils";

/**
 * Mobile thumb-zone tabs — phones only.
 * Primary navigation always lives in the header (HeaderMainNav);
 * this bar is an extra shortcut under `md`, not a replacement that
 * makes header nav disappear.
 */
export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const { t, ready } = useAppTranslation("common");
  const { data: chatUnread = 0 } = useQuery({
    queryKey: chatKeys.unread(),
    queryFn: () => chatApi.unreadCount(),
    refetchInterval: 12_000,
  });

  return (
    <nav
      aria-label={ready ? t("nav.ariaLabel") : "Main"}
      className={[
        "border-t border-border bg-card/95 backdrop-blur-md",
        "supports-backdrop-filter:bg-card/80",
        "pb-[env(safe-area-inset-bottom)]",
        /* Only pure mobile — tablet/desktop use header nav alone */
        "md:hidden",
      ].join(" ")}
    >
      <ul className="flex h-16 items-stretch justify-between gap-1 px-1.5">
        {MAIN_TABS.map((tab) => {
          const active = isTabActive(pathname, tab);
          const Icon = tab.icon;
          const label = ready ? t(tab.labelKey) : tab.id;
          const showBadge = tab.id === "chat" && chatUnread > 0;

          return (
            <li key={tab.id} className="min-w-0 flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium transition-colors",
                  "active:scale-[0.98]",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex size-8 items-center justify-center rounded-xl transition-colors",
                    active && "bg-primary/15 shadow-amber-glow",
                  )}
                >
                  <Icon
                    className={cn("size-5", active && "stroke-[2.25px]")}
                    aria-hidden
                  />
                  {showBadge ? (
                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {chatUnread > 9 ? "9+" : chatUnread}
                    </span>
                  ) : null}
                </span>
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
