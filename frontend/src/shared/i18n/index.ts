export {
  DEFAULT_LANGUAGE,
  DEFAULT_NS,
  LOCALE_STORAGE_KEY,
  NAMESPACES,
  PRELOAD_NAMESPACES,
  SUPPORTED_LANGUAGES,
  isAppLanguage,
  type AppLanguage,
  type AppNamespace,
} from "./config";
export { changeAppLanguage, i18n, initI18n } from "./client";
export { loadNamespaces } from "./load-namespaces";
