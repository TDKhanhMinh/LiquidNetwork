import type { ReactNode } from "react";

interface AppShellProps {
  /** Composed by the app layer (e.g. Header) */
  header?: ReactNode;
  /** Mobile/tablet bottom tabs — hide on lg via BottomNav itself */
  bottomNav?: ReactNode;
  children: ReactNode;
}

/**
 * In-app chrome inside full-width AppFrame.
 *
 * - Header always carries primary nav (all breakpoints).
 * - BottomNav: phone thumb shortcut only (`md:hidden` inside the widget).
 */
export function AppShell({ header, bottomNav, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      {header}

      <main className="flex min-w-0 w-full flex-1 flex-col">{children}</main>

      {bottomNav ? (
        <div className="sticky bottom-0 z-40 mt-auto w-full shrink-0">
          {bottomNav}
        </div>
      ) : null}
    </div>
  );
}
