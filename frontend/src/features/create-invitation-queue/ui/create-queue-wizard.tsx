"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  Loader2Icon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import type { QueueUserRef } from "@/entities/invitation-queue";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { useCreateQueue } from "../hook/use-create-queue";
import {
  useCandidateSuggestions,
  useSearchCandidates,
} from "../hook/use-search-candidates";

const TIMEOUT_OPTIONS = [30, 60, 90, 120, 180] as const;

type Step = "people" | "config";

export function CreateQueueWizard() {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["invitation-queue", "common"]);
  const createQueue = useCreateQueue();

  const [step, setStep] = useState<Step>("people");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<QueueUserRef[]>([]);
  const [timeoutSeconds, setTimeoutSeconds] = useState(60);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const search = useSearchCandidates(query);
  const suggestions = useCandidateSuggestions();

  const pool = useMemo(() => {
    const list = query.trim() ? (search.data ?? []) : (suggestions.data ?? []);
    const selectedIds = new Set(selected.map((s) => s.id));
    return list.filter((u) => !selectedIds.has(u.id));
  }, [query, search.data, suggestions.data, selected]);

  function toggleSelect(user: QueueUserRef) {
    setSelected((prev) => {
      if (prev.some((p) => p.id === user.id)) {
        return prev.filter((p) => p.id !== user.id);
      }
      return [...prev, user];
    });
  }

  function move(index: number, dir: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index]!;
      next[index] = next[target]!;
      next[target] = tmp;
      return next;
    });
  }

  async function handleCreate() {
    setLocalError(null);
    if (selected.length === 0) {
      setLocalError(t("create.validation.minPeople"));
      setStep("people");
      return;
    }
    try {
      const queue = await createQueue.mutateAsync({
        title: title.trim() || undefined,
        message: message.trim() || undefined,
        timeoutSeconds,
        inviteeIds: selected.map((s) => s.id),
        invitees: selected,
      });
      router.replace(routes.queueLive(queue.id));
    } catch {
      // toast via mutation
    }
  }

  if (!ready) return null;

  return (
    <div className="page-shell gap-5 md:gap-6">
      <header className="space-y-1">
        <h1 className="page-title">{t("create.title")}</h1>
        <p className="page-subtitle">
          {t("create.description")}
        </p>
      </header>

      {/* Step indicator */}
      <div className="flex gap-2">
        {(["people", "config"] as const).map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={cn(
              "flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
              step === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {i + 1}. {t(`create.steps.${s}`)}
          </button>
        ))}
      </div>

      {step === "people" ? (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("create.searchPlaceholder")}
              className="h-12 min-h-11 rounded-xl border-border bg-muted/40 pl-10 text-base"
            />
          </div>

          {selected.length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold">
                {t("create.selected", { count: selected.length })}
              </h2>
              <ul className="space-y-2">
                {selected.map((user, index) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[user.occupation, user.alcoholToleranceLevel]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        aria-label={t("create.moveUp")}
                      >
                        <ArrowUpIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === selected.length - 1}
                        onClick={() => move(index, 1)}
                        aria-label={t("create.moveDown")}
                      >
                        <ArrowDownIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleSelect(user)}
                        aria-label={t("create.remove")}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">
              {query.trim() ? t("create.searchResults") : t("create.suggestions")}
            </h2>
            <ul className="space-y-2">
              {pool.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => toggleSelect(user)}
                    className="flex w-full min-h-14 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left transition-colors active:bg-muted"
                  >
                    <span className="flex size-10 items-center justify-center rounded-full bg-secondary/50 text-sm font-semibold">
                      {user.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[user.occupation, user.alcoholToleranceLevel]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {t("create.add")}
                    </Badge>
                  </button>
                </li>
              ))}
              {pool.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t("create.noResults")}
                </p>
              ) : null}
            </ul>
          </section>

          <Button
            type="button"
            className="min-h-12 rounded-xl text-base font-semibold"
            disabled={selected.length === 0}
            onClick={() => setStep("config")}
          >
            {t("create.nextConfig")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="queue-title">{t("create.fields.title")}</Label>
            <Input
              id="queue-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("create.fields.titlePlaceholder")}
              className="h-12 min-h-11 rounded-xl border-border bg-muted/40 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="queue-message">{t("create.fields.message")}</Label>
            <Textarea
              id="queue-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("create.fields.messagePlaceholder")}
              className="min-h-24 rounded-xl border-border bg-muted/40 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("create.fields.timeout")}</Label>
            <div className="flex flex-wrap gap-2">
              {TIMEOUT_OPTIONS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTimeoutSeconds(sec)}
                  className={cn(
                    "min-h-11 rounded-xl border px-4 text-sm font-medium transition-colors",
                    timeoutSeconds === sec
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {sec}s
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("create.fields.timeoutHint")}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium">
              {t("create.summary.people", { count: selected.length })}
            </p>
            <p className="mt-1 text-muted-foreground">
              {selected.map((s) => s.name).join(" → ")}
            </p>
          </div>

          {localError ? (
            <p role="alert" className="text-sm text-destructive">
              {localError}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-12 flex-1 rounded-xl"
              onClick={() => setStep("people")}
            >
              {t("common:actions.back")}
            </Button>
            <Button
              type="button"
              className="min-h-12 flex-1 rounded-xl text-base font-semibold"
              disabled={createQueue.isPending}
              onClick={handleCreate}
            >
              {createQueue.isPending ? (
                <>
                  <Loader2Icon className="size-5 animate-spin" />
                  {t("create.submitting")}
                </>
              ) : (
                <>
                  <CheckIcon />
                  {t("create.submit")}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
