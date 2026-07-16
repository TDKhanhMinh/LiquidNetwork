"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { env, routes } from "@/shared/config";
import { MaintenanceScreen } from "./maintenance-screen";

/**
 * When NEXT_PUBLIC_MAINTENANCE=true, block main app UI (except /maintenance).
 */
export function MaintenanceGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (!env.maintenanceMode) return <>{children}</>;
  if (pathname === routes.maintenance) return <>{children}</>;
  return <MaintenanceScreen />;
}
