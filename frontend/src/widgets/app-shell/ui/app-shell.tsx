import type { ReactNode } from "react";

interface AppShellProps {
  /** Composed by the app layer (e.g. Header) — avoids same-layer widget imports */
  header?: ReactNode;
  children: ReactNode;
}

/**
 * Layout chrome wrapper. Peers widgets (Header, etc.) must be passed in from `app/`,
 * not imported here — FSD: slices on the same layer stay isolated.
 */
export function AppShell({ header, children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      {header}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
