"use client";

import {
  SUPPORTED_LANGUAGES,
  changeAppLanguage,
  type AppLanguage,
} from "@/shared/i18n";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";

export function LanguageSwitcher() {
  const { t, i18n } = useAppTranslation("common");
  const active = (i18n.language?.split("-")[0] ?? "vi") as AppLanguage;

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t("language.label")}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <Button
          key={lng}
          type="button"
          size="xs"
          variant={active === lng ? "default" : "ghost"}
          onClick={() => {
            void changeAppLanguage(lng);
          }}
        >
          {t(`language.${lng}`)}
        </Button>
      ))}
    </div>
  );
}
