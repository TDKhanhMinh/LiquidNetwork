"use client";

import Link from "next/link";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function HeaderBrand() {
  const { t } = useAppTranslation("common");

  return (
    <Link href="/home" className="font-semibold tracking-tight">
      {t("appName")}
    </Link>
  );
}
