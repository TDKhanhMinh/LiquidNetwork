"use client";

import { i18n, initI18n } from "./client";

const pending = new Map<string, Promise<void>>();

function cacheKey(lng: string, ns: string) {
  return `${lng}::${ns}`;
}

/**
 * Ensure one or more namespaces are loaded for the active (or given) language.
 * Safe to call repeatedly — concurrent calls are de-duplicated.
 */
export async function loadNamespaces(
  ns: string | string[],
  lng?: string,
): Promise<void> {
  await initI18n();

  const language = lng ?? i18n.language ?? "vi";
  const namespaces = Array.isArray(ns) ? ns : [ns];

  await Promise.all(
    namespaces.map(async (namespace) => {
      if (i18n.hasResourceBundle(language, namespace)) {
        return;
      }

      const key = cacheKey(language, namespace);
      let task = pending.get(key);
      if (!task) {
        task = i18n
          .loadNamespaces(namespace)
          .then(() => undefined)
          .finally(() => {
            pending.delete(key);
          });
        pending.set(key, task);
      }
      await task;
    }),
  );
}
