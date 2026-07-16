"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { userApi } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { getPostAuthPath } from "@/shared/lib/post-auth-path";
import { normalizeVnPhone } from "@/shared/lib/phone";
import { cn } from "@/shared/lib/utils";
import { useRegister } from "../hook/use-register";

interface RegisterFormProps {
  className?: string;
  embedded?: boolean;
}

export function RegisterForm({ className, embedded }: RegisterFormProps) {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["auth", "error", "common"]);
  const { register, isLoading, error } = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (password.length < 8) {
      setLocalError(t("register.passwordMin"));
      return;
    }
    if (password !== confirmPassword) {
      setLocalError(t("register.passwordMismatch"));
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Best-effort: attach optional phone after account creation
      if (phone.trim()) {
        try {
          await userApi.updateMe({ phone: normalizeVnPhone(phone) });
        } catch {
          // non-blocking
        }
      }

      router.replace(getPostAuthPath());
    } catch {
      // error in hook state
    }
  }

  const displayError = localError ?? error;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      {!embedded ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("register.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("register.subtitle")}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-name" className="text-[13px]">
          {t("register.name")}
        </Label>
        <Input
          id="register-name"
          type="text"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("register.namePlaceholder")}
          className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-email" className="text-[13px]">
          {t("register.email")}
        </Label>
        <Input
          id="register-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("register.emailPlaceholder")}
          className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-phone" className="text-[13px]">
          {t("register.phoneOptional")}
        </Label>
        <Input
          id="register-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("register.phonePlaceholder")}
          className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-password" className="text-[13px]">
          {t("register.password")}
        </Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("register.passwordPlaceholder")}
            className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 pr-12 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-1 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground"
            aria-label={
              showPassword ? t("login.hidePassword") : t("login.showPassword")
            }
          >
            {showPassword ? (
              <EyeOffIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("register.passwordHint")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-confirm" className="text-[13px]">
          {t("register.confirmPassword")}
        </Label>
        <Input
          id="register-confirm"
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t("register.confirmPasswordPlaceholder")}
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
            {t("register.submitting")}
          </>
        ) : (
          t("register.submit")
        )}
      </Button>
    </form>
  );
}
