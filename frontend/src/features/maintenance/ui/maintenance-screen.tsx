"use client";

import Link from "next/link";
import { WrenchIcon } from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { AppFrame } from "@/shared/ui/app-frame";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export function MaintenanceScreen() {
  const { t, ready } = useAppTranslation("common");
  if (!ready) return null;

  return (
    <AppFrame>
      <div className="page-shell flex-1 items-center justify-center gap-5 py-16 text-center md:gap-6 md:py-20">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-warning/15 text-warning md:size-[4.5rem]">
          <WrenchIcon className="size-8 md:size-9" />
        </span>
        <div className="space-y-2 md:space-y-2.5">
          <p className="font-mono text-xs tracking-widest text-warning uppercase md:text-[0.8125rem]">
            Maintenance
          </p>
          <h1 className="page-title">{t("states.maintenance.title")}</h1>
          <p className="page-subtitle mx-auto max-w-sm">
            {t("states.maintenance.description")}
          </p>
        </div>
        <Link
          href={routes.home}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 rounded-xl md:min-h-12",
          )}
        >
          {t("errors.actions.home")}
        </Link>
      </div>
    </AppFrame>
  );
}
