import type { ReactNode } from "react";

interface AppShellProps {
  /** Composed by the app layer (e.g. Header) — avoids same-layer widget imports */
  header?: ReactNode;
  /** Bottom tab bar — pass from app layer */
  bottomNav?: ReactNode;
  children: ReactNode;
}

/**
 * Layout chrome wrapper. Peers widgets (Header, BottomNav, etc.) must be passed
 * in from `app/`, not imported here — FSD: slices on the same layer stay isolated.
 */
export function AppShell({ header, bottomNav, children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      {header}
      <main className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      {bottomNav ? (
        <div className="fixed inset-x-0 bottom-0 z-40 md:static md:z-auto">
          {bottomNav}
        </div>
      ) : null}
    </div>
  );
}
