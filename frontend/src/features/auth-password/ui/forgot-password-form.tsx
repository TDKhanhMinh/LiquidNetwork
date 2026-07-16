"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2Icon, MailCheckIcon } from "lucide-react";
import { env, routes } from "@/shared/config";
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
import { useForgotPassword } from "../hook/use-forgot-password";

export function ForgotPasswordForm() {
  const { t, ready } = useAppTranslation(["auth", "error", "common"]);
  const { forgotPassword, isLoading, error, success } = useForgotPassword();
  const [email, setEmail] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await forgotPassword(email.trim());
    } catch {
      // hook
    }
  }

  if (success) {
    return (
      <Card className="w-full rounded-2xl border-border bg-card py-0 shadow-amber-glow ring-1 ring-primary/15">
        <CardHeader className="items-center gap-3 px-5 pt-8 pb-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
            <MailCheckIcon className="size-7" aria-hidden />
          </span>
          <CardTitle>{t("forgotPassword.successTitle")}</CardTitle>
          <CardDescription className="text-[15px]">
            {t("forgotPassword.successBody")}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center px-5 pb-6">
          <Link
            href={routes.login}
            className={cn(
              buttonVariants({ variant: "default" }),
              "min-h-11 rounded-xl",
            )}
          >
            {t("forgotPassword.backToLogin")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-2xl border-border bg-card py-0 shadow-amber-glow ring-1 ring-primary/15">
      <CardHeader className="gap-2 border-b border-border/60 px-5 pt-6 pb-5">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {ready ? t("forgotPassword.title") : "…"}
        </CardTitle>
        <CardDescription className="text-[15px]">
          {t("forgotPassword.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pt-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email">{t("forgotPassword.email")}</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("forgotPassword.emailPlaceholder")}
              className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base"
            />
          </div>

          {env.authMock ? (
            <p className="text-xs text-primary/90">
              {t("forgotPassword.mockHint")}
            </p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              {error}
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
                {t("forgotPassword.submitting")}
              </>
            ) : (
              t("forgotPassword.submit")
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-border/60 px-5 py-4">
        <Link
          href={routes.login}
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t("forgotPassword.backToLogin")}
        </Link>
      </CardFooter>
    </Card>
  );
}
