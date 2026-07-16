"use client";

import Link from "next/link";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function HeaderBrand() {
  const { t } = useAppTranslation("common");

  return (
    <Link
      href="/home"
      className="shrink-0 font-semibold tracking-tight md:text-lg"
    >
      {t("appName")}
    </Link>
  );
}
