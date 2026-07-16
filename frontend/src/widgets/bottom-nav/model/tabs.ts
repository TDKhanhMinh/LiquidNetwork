import {
  CompassIcon,
  HomeIcon,
  ListOrderedIcon,
  MessageCircleIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/shared/config";

export type MainTabId = "home" | "queue" | "discover" | "chat" | "profile";

export interface MainTab {
  id: MainTabId;
  href: string;
  labelKey: `nav.${MainTabId}`;
  icon: LucideIcon;
  /** Match nested routes (e.g. /queue/new still highlights Queue) */
  matchPrefix?: string;
}

export const MAIN_TABS: readonly MainTab[] = [
  {
    id: "home",
    href: routes.home,
    labelKey: "nav.home",
    icon: HomeIcon,
  },
  {
    id: "queue",
    href: routes.queue,
    labelKey: "nav.queue",
    icon: ListOrderedIcon,
    matchPrefix: "/queue",
  },
  {
    id: "discover",
    href: routes.discover,
    labelKey: "nav.discover",
    icon: CompassIcon,
    matchPrefix: "/discover",
  },
  {
    id: "chat",
    href: routes.chat,
    labelKey: "nav.chat",
    icon: MessageCircleIcon,
    matchPrefix: "/chat",
  },
  {
    id: "profile",
    href: routes.profile,
    labelKey: "nav.profile",
    icon: UserRoundIcon,
    matchPrefix: "/profile",
  },
] as const;

export function isTabActive(pathname: string, tab: MainTab): boolean {
  if (tab.id === "home") {
    return pathname === routes.home;
  }
  const prefix = tab.matchPrefix ?? tab.href;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
