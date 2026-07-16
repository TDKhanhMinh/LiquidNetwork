"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { initI18n, loadNamespaces } from "@/shared/i18n";

/**
 * App translation hook with automatic lazy-loading of namespaces.
 *
 * @example
 * const { t, ready } = useAppTranslation(["auth", "error"]);
 * t("login.title");
 */
export function useAppTranslation(ns: string | string[] = "common") {
  const nsKey = Array.isArray(ns) ? ns.join("|") : ns;
  const namespaces = useMemo(
    () => (nsKey.includes("|") ? nsKey.split("|") : [nsKey]),
    [nsKey],
  );

  // Bump after async namespace load so `ready` re-evaluates
  const [loadGeneration, setLoadGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await initI18n();
      await loadNamespaces(namespaces);
      if (!cancelled) {
        setLoadGeneration((g) => g + 1);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [namespaces]);

  const translation = useTranslation(namespaces);
  const language = translation.i18n.language;

  const ready =
    loadGeneration >= 0 &&
    translation.ready &&
    namespaces.every((namespace) =>
      translation.i18n.hasResourceBundle(language, namespace),
    );

  return {
    ...translation,
    ready,
  };
}
