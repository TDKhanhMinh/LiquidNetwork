import { LanguageSwitcher } from "./language-switcher";
import { HeaderBrand } from "./header-brand";

/**
 * App header widget — compose features (e.g. logout) here as product grows.
 */
export function Header() {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4">
      <HeaderBrand />
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
