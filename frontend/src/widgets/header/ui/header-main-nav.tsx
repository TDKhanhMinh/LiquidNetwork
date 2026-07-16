"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { chatApi, chatKeys } from "@/entities/chat";
import { MAIN_TABS, isTabActive } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { cn } from "@/shared/lib/utils";

/**
 * Primary app nav in the header — **always visible** at every breakpoint.
 * Compact (icon-first) on narrow viewports; full labels from md/lg up.
 * Horizontal scroll if the row overflows so items are never clipped/hidden.
 */
export function HeaderMainNav() {
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
      className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="mx-auto flex w-max max-w-full items-center gap-0.5 rounded-2xl border border-border/80 bg-muted/35 p-1 sm:gap-1">
        {MAIN_TABS.map((tab) => {
          const active = isTabActive(pathname, tab);
          const Icon = tab.icon;
          const label = ready ? t(tab.labelKey) : tab.id;
          const showBadge = tab.id === "chat" && chatUnread > 0;

          return (
            <li key={tab.id} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={label}
                className={cn(
                  "relative inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-colors",
                  "sm:h-10 sm:px-3 sm:text-sm md:gap-2 md:px-3.5 lg:px-4",
                  active
                    ? "bg-primary/15 text-primary shadow-amber-glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 sm:size-[1.05rem]",
                    active && "stroke-[2.25px]",
                  )}
                  aria-hidden
                />
                {/* Labels: compact hide on very narrow, show from sm */}
                <span className="hidden max-w-[5.5rem] truncate sm:inline">
                  {label}
                </span>
                {showBadge ? (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground sm:static sm:ml-0.5 sm:size-5 sm:text-[10px]">
                    {chatUnread > 9 ? "9+" : chatUnread}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
