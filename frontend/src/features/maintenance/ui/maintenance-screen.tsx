"use client";

import Link from "next/link";
import { WrenchIcon } from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export function MaintenanceScreen() {
  const { t, ready } = useAppTranslation("common");
  if (!ready) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-warning/15 text-warning">
        <WrenchIcon className="size-8" />
      </span>
      <div className="space-y-2">
        <p className="font-mono text-xs tracking-widest text-warning uppercase">
          Maintenance
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("states.maintenance.title")}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("states.maintenance.description")}
        </p>
      </div>
      <Link
        href={routes.home}
        className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
      >
        {t("errors.actions.home")}
      </Link>
    </div>
  );
}
