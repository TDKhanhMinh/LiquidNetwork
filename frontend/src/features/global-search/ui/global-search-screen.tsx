"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  PageEmpty,
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useGlobalSearch } from "../hook/use-global-search";

export function GlobalSearchScreen() {
  const { t, ready } = useAppTranslation(["search", "common"]);
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, refetch, isFetching } =
    useGlobalSearch(query);

  if (!ready) return null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="h-12 min-h-11 rounded-xl pl-10"
          autoFocus
        />
      </div>

      {isFetching ? (
        <p className="text-xs text-muted-foreground">{t("common:actions.loading")}</p>
      ) : null}

      {isLoading && !data ? (
        <PageLoading compact />
      ) : isError ? (
        <PageErrorInline
          compact
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (data?.items.length ?? 0) === 0 ? (
        <PageEmpty
          title={t("empty")}
          description={t("emptyHint")}
          compact
        />
      ) : (
        <ul className="space-y-2">
          {data!.items.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 active:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {item.title}
                    </p>
                    {item.badge ? (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </div>
                  {item.subtitle ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {t(`types.${item.type}`)}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
