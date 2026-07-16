import { LanguageSwitcher } from "./language-switcher";
import { HeaderBrand } from "./header-brand";
import { HeaderMainNav } from "./header-main-nav";
import { HeaderNotificationsButton } from "./header-notifications-button";

/**
 * App header — primary nav always in the bar (all breakpoints).
 * Compact icon+label on small screens; full labels when space allows.
 * BottomNav remains a mobile thumb shortcut only.
 */
export function Header() {
  return (
    <header
      className={[
        "sticky top-0 z-40 w-full shrink-0",
        "border-b border-border bg-background/95 backdrop-blur-md",
        "supports-backdrop-filter:bg-background/80",
        "pt-[env(safe-area-inset-top)]",
      ].join(" ")}
    >
      <div className="mx-auto flex h-14 w-full min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-4 md:h-16 md:gap-4 md:px-6 lg:px-8 xl:px-10">
        <div className="hidden shrink-0 sm:block">
          <HeaderBrand />
        </div>
        <HeaderMainNav />
        <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
          <HeaderNotificationsButton />
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
