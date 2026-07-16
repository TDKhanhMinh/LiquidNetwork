export const SUPPORTED_LANGUAGES = ["vi", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "vi";

export const LOCALE_STORAGE_KEY = "ln.locale";

/** Namespaces available as lazy-loaded JSON under locales/{lng}/{ns}.json */
export const NAMESPACES = [
  "common",
  "auth",
  "user",
  "drinking-session",
  "error",
  "invitation-queue",
  "matchmaking",
  "safe-ride",
  "chat",
  "notification",
  "friends",
  "search",
  "support",
  "monetization",
] as const;

export type AppNamespace = (typeof NAMESPACES)[number];

/** Loaded at init so errors and chrome always work */
export const PRELOAD_NAMESPACES: AppNamespace[] = ["common", "error"];

export const DEFAULT_NS: AppNamespace = "common";

export function isAppLanguage(value: string): value is AppLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
