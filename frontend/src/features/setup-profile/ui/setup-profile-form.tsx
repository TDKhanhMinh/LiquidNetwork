"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import {
  ALCOHOL_TOLERANCE_LEVELS,
  type AlcoholToleranceLevel,
  type Gender,
} from "@/entities/user";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { normalizeVnPhone } from "@/shared/lib/phone";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useSetupProfile } from "../hook/use-setup-profile";

const GENDERS: Gender[] = ["male", "female", "other", "prefer_not"];

export function SetupProfileForm() {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["auth", "error", "common"]);
  const { setupProfile, isLoading, error } = useSetupProfile();

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear - 16; y >= currentYear - 80; y -= 1) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("prefer_not");
  const [birthYear, setBirthYear] = useState<string>(String(currentYear - 25));
  const [level, setLevel] = useState<AlcoholToleranceLevel | "">("");
  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError(t("setupProfile.validation.nameRequired"));
      return;
    }
    const year = Number(birthYear);
    if (!Number.isFinite(year) || year < currentYear - 80 || year > currentYear - 16) {
      setLocalError(t("setupProfile.validation.birthYearInvalid"));
      return;
    }
    if (!level) {
      setLocalError(t("setupProfile.validation.levelRequired"));
      return;
    }

    try {
      await setupProfile({
        name: name.trim(),
        gender,
        birthYear: year,
        alcoholToleranceLevel: level,
        phone: phone.trim() ? normalizeVnPhone(phone) : undefined,
      });
      router.replace(routes.home);
    } catch {
      // hook
    }
  }

  const displayError = localError ?? error;

  return (
    <Card className="w-full rounded-2xl border-border bg-card py-0 shadow-amber-glow ring-1 ring-primary/15">
      <CardHeader className="gap-2 border-b border-border/60 px-5 pt-6 pb-5">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {ready ? t("setupProfile.title") : "…"}
        </CardTitle>
        <CardDescription className="text-[15px]">
          {t("setupProfile.subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pt-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="setup-name">{t("setupProfile.fields.name")}</Label>
            <Input
              id="setup-name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("setupProfile.fields.namePlaceholder")}
              className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="setup-gender">
              {t("setupProfile.fields.gender")}
            </Label>
            <Select
              value={gender}
              onValueChange={(v) => {
                if (v) setGender(v as Gender);
              }}
            >
              <SelectTrigger
                id="setup-gender"
                className="h-12 min-h-11 w-full rounded-xl border-border bg-muted/40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {t(`setupProfile.genderOptions.${g}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="setup-year">
              {t("setupProfile.fields.birthYear")}
            </Label>
            <Select
              value={birthYear}
              onValueChange={(v) => {
                if (v) setBirthYear(v);
              }}
            >
              <SelectTrigger
                id="setup-year"
                className="h-12 min-h-11 w-full rounded-xl border-border bg-muted/40"
              >
                <SelectValue
                  placeholder={t("setupProfile.fields.birthYearPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("setupProfile.fields.toleranceLevel")}</Label>
            <div className="grid gap-2">
              {ALCOHOL_TOLERANCE_LEVELS.map((lv) => {
                const selected = level === lv;
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setLevel(lv)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-muted/30 hover:bg-muted/50",
                    )}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {t(`setupProfile.levels.${lv}`)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t(`setupProfile.levels.${lv}Hint`)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="setup-phone">{t("setupProfile.fields.phone")}</Label>
            <Input
              id="setup-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("setupProfile.fields.phonePlaceholder")}
              className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base"
            />
          </div>

          {displayError ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              {displayError}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading || !ready}
            className="min-h-12 w-full rounded-xl text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="size-5 animate-spin" />
                {t("setupProfile.submitting")}
              </>
            ) : (
              t("setupProfile.submit")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
