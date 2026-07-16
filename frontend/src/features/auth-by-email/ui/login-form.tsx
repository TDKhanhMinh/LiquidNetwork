"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { getPostAuthPath } from "@/shared/lib/post-auth-path";
import { cn } from "@/shared/lib/utils";
import { useLogin } from "../hook/use-login";

interface LoginFormProps {
  className?: string;
  /** Hide outer chrome when embedded in tabs */
  embedded?: boolean;
}

export function LoginForm({ className, embedded }: LoginFormProps) {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["auth", "error", "common"]);
  const { login, isLoading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login({ email: email.trim(), password });
      router.replace(getPostAuthPath());
    } catch {
      // error in hook state
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5 md:gap-6", className)}
      noValidate
    >
      {!embedded ? (
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold md:text-xl">
            {t("login.title")}
          </h2>
          <p className="text-sm text-muted-foreground md:text-[0.9375rem]">
            {t("login.subtitle")}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email" className="text-[13px] text-foreground">
          {t("login.email")}
        </Label>
        <Input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("login.emailPlaceholder")}
          className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base md:text-[15px]"
          aria-invalid={Boolean(error) || undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label
            htmlFor="login-password"
            className="text-[13px] text-foreground"
          >
            {t("login.password")}
          </Label>
          <Link
            href={routes.forgotPassword}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.passwordPlaceholder")}
            className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 pr-12 text-base md:text-[15px]"
            aria-invalid={Boolean(error) || undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-1 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground active:bg-muted/60"
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
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm leading-relaxed text-destructive"
        >
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isLoading || !ready}
        className="min-h-12 w-full rounded-xl text-base font-semibold active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <Loader2Icon className="size-5 animate-spin" />
            {t("login.submitting")}
          </>
        ) : (
          t("login.submit")
        )}
      </Button>
    </form>
  );
}
