"use client";

import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_NS,
  LOCALE_STORAGE_KEY,
  PRELOAD_NAMESPACES,
  isAppLanguage,
  type AppLanguage,
} from "./config";

function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isAppLanguage(stored)) {
      return stored;
    }
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  return DEFAULT_LANGUAGE;
}

function syncDocumentLang(lng: string) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
}

let initPromise: Promise<typeof i18n> | null = null;
let languageListenerBound = false;

/**
 * Initialize i18next once with lazy JSON loading.
 * Language-first paths: `./locales/{{lng}}/{{ns}}.json`
 *
 * Safe on server (SSG/SSR) and client. Uses default language on server;
 * client re-applies stored preference after init.
 */
export function initI18n(): Promise<typeof i18n> {
  if (i18n.isInitialized) {
    return Promise.resolve(i18n);
  }
  if (initPromise) {
    return initPromise;
  }

  const lng = readStoredLanguage();

  initPromise = i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`./locales/${language}/${namespace}.json`),
      ),
    )
    .init({
      lng,
      fallbackLng: DEFAULT_LANGUAGE,
      ns: PRELOAD_NAMESPACES,
      defaultNS: DEFAULT_NS,
      partialBundledLanguages: true,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: true,
      },
    })
    .then(() => {
      if (!languageListenerBound) {
        languageListenerBound = true;
        syncDocumentLang(i18n.language);
        i18n.on("languageChanged", (next) => {
          syncDocumentLang(next);
          if (typeof window === "undefined") return;
          try {
            if (isAppLanguage(next)) {
              window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
            }
          } catch {
            // ignore
          }
        });
      }

      // After hydrate, align with localStorage if it differs from server default
      if (typeof window !== "undefined") {
        const preferred = readStoredLanguage();
        if (preferred !== i18n.language) {
          void i18n.changeLanguage(preferred);
        }
      }

      return i18n;
    });

  return initPromise;
}

// Register instance as soon as this module is imported (SSR + client)
void initI18n();

export async function changeAppLanguage(lng: AppLanguage): Promise<void> {
  await initI18n();
  await i18n.changeLanguage(lng);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, lng);
    } catch {
      // ignore
    }
  }
  syncDocumentLang(lng);
}

export { i18n };
