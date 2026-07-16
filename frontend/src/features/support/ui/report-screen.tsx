"use client";

import { useState, type FormEvent } from "react";
import type { ReportCategory } from "@/entities/support";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { PageSuccess } from "@/widgets/page-state";
import { Loader2Icon } from "lucide-react";
import { useCreateReport } from "../hook/use-support";

const CATEGORIES: ReportCategory[] = [
  "abuse",
  "spam",
  "safety",
  "payment",
  "bug",
  "other",
];

export function ReportScreen() {
  const { t, ready } = useAppTranslation(["support", "common"]);
  const create = useCreateReport();
  const [category, setCategory] = useState<ReportCategory>("abuse");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (!subject.trim() || description.trim().length < 10) {
      setLocalError(t("report.validation"));
      return;
    }
    try {
      await create.mutateAsync({
        category,
        subject: subject.trim(),
        description: description.trim(),
      });
      setDone(true);
    } catch {
      // toast
    }
  }

  if (!ready) return null;

  if (done) {
    return (
      <PageSuccess
        title={t("report.successTitle")}
        description={t("report.successBody")}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("report.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("report.subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label>{t("report.category")}</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={
                  category === c
                    ? "min-h-10 rounded-xl border border-primary bg-primary/15 px-3 text-xs font-medium text-primary"
                    : "min-h-10 rounded-xl border border-border px-3 text-xs font-medium text-muted-foreground"
                }
              >
                {t(`report.categories.${c}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rep-subject">{t("report.subject")}</Label>
          <Input
            id="rep-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-12 min-h-11 rounded-xl"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rep-desc">{t("report.description")}</Label>
          <Textarea
            id="rep-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-32 rounded-xl"
            placeholder={t("report.placeholder")}
            required
          />
        </div>

        {localError ? (
          <p role="alert" className="text-sm text-destructive">
            {localError}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={create.isPending}
          className="min-h-12 rounded-xl"
        >
          {create.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          {t("report.submit")}
        </Button>
      </form>
    </div>
  );
}
