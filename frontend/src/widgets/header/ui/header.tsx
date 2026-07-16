import { LanguageSwitcher } from "./language-switcher";
import { HeaderBrand } from "./header-brand";
import { HeaderNotificationsButton } from "./header-notifications-button";

/**
 * App header widget — compose features (e.g. logout) here as product grows.
 * Unread badge uses entity notification API (widgets → entities OK).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <HeaderBrand />
      <div className="flex items-center gap-1">
        <HeaderNotificationsButton />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
