"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { useResetPassword } from "../hook/use-reset-password";

interface ResetPasswordFormProps {
  token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { t, ready } = useAppTranslation(["auth", "error", "common"]);
  const { resetPassword, isLoading, error, success } = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (!token) {
      setLocalError(t("resetPassword.missingToken"));
      return;
    }
    if (password.length < 8) {
      setLocalError(t("resetPassword.passwordMin"));
      return;
    }
    if (password !== confirm) {
      setLocalError(t("resetPassword.passwordMismatch"));
      return;
    }
    try {
      await resetPassword(token, password);
    } catch {
      // hook
    }
  }

  if (!token) {
    return (
      <Card className="w-full rounded-2xl border-border bg-card py-0 shadow-amber-glow ring-1 ring-primary/15">
        <CardHeader className="gap-2 px-5 pt-6 pb-4 text-center">
          <CardTitle>{t("resetPassword.title")}</CardTitle>
          <CardDescription>{t("resetPassword.missingToken")}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center px-5 pb-6">
          <Link
            href={routes.forgotPassword}
            className={cn(
              buttonVariants({ variant: "default" }),
              "min-h-11 rounded-xl",
            )}
          >
            {t("forgotPassword.title")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full rounded-2xl border-border bg-card py-0 shadow-amber-glow ring-1 ring-primary/15">
        <CardHeader className="items-center gap-3 px-5 pt-8 pb-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2Icon className="size-7" aria-hidden />
          </span>
          <CardTitle>{t("resetPassword.successTitle")}</CardTitle>
          <CardDescription>{t("resetPassword.successBody")}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center px-5 pb-6">
          <Link
            href={routes.login}
            className={cn(
              buttonVariants({ variant: "default" }),
              "min-h-11 rounded-xl",
            )}
          >
            {t("register.goLogin")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const displayError = localError ?? error;

  return (
    <Card className="w-full rounded-2xl border-border bg-card py-0 shadow-amber-glow ring-1 ring-primary/15">
      <CardHeader className="gap-2 border-b border-border/60 px-5 pt-6 pb-5">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {ready ? t("resetPassword.title") : "…"}
        </CardTitle>
        <CardDescription>{t("resetPassword.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pt-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reset-password">{t("resetPassword.password")}</Label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reset-confirm">
              {t("resetPassword.confirmPassword")}
            </Label>
            <Input
              id="reset-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
                {t("resetPassword.submitting")}
              </>
            ) : (
              t("resetPassword.submit")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
