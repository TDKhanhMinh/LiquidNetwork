"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import type { OtpPurpose } from "@/entities/session";
import { env, routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { getPostAuthPath } from "@/shared/lib/post-auth-path";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/ui/input-otp";
import { Label } from "@/shared/ui/label";
import { useSendPhoneOtp } from "../hook/use-send-phone-otp";
import { useVerifyPhoneOtp } from "../hook/use-verify-phone-otp";

const RESEND_SECONDS = 60;

interface VerifyOtpFormProps {
  phone: string;
  purpose: OtpPurpose;
  name?: string;
  className?: string;
}

export function VerifyOtpForm({
  phone,
  purpose,
  name,
  className,
}: VerifyOtpFormProps) {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["auth", "error", "common"]);
  const { verifyOtp, isLoading, error } = useVerifyPhoneOtp();
  const { sendOtp, isLoading: isResending } = useSendPhoneOtp();
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (code.length !== 6) {
      setLocalError(t("verifyOtp.invalid"));
      return;
    }
    try {
      await verifyOtp(phone, code, name);
      router.replace(getPostAuthPath());
    } catch {
      // hook error
    }
  }

  async function handleResend() {
    if (cooldown > 0 || isResending) return;
    try {
      await sendOtp(phone, purpose);
      setCooldown(RESEND_SECONDS);
      setCode("");
    } catch {
      // ignore — keep prior error surface
    }
  }

  const displayError = localError ?? error;
  const destination = phone || "—";

  if (!phone) {
    return (
      <div className="space-y-4 text-center">
        <p className="page-subtitle">
          {t("verifyOtp.missingPhone")}
        </p>
        <Link
          href={routes.login}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          {t("common:actions.back")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      noValidate
    >
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ready ? t("verifyOtp.title") : "…"}
        </h1>
        <p className="page-subtitle">
          {t("verifyOtp.subtitle", { destination })}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Label htmlFor="otp" className="sr-only">
          {t("verifyOtp.code")}
        </Label>
        <InputOTP
          id="otp"
          maxLength={6}
          value={code}
          onChange={setCode}
          containerClassName="justify-center gap-2"
        >
          <InputOTPGroup className="gap-1.5 bg-transparent p-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="size-11 rounded-xl border border-border bg-muted/40 text-base first:rounded-xl first:border-l last:rounded-xl"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {env.authMock ? (
        <p className="text-center text-xs text-primary/90">
          {t("phone.mockHint")}
        </p>
      ) : null}

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
        disabled={isLoading || !ready || code.length !== 6}
        className="min-h-12 w-full rounded-xl text-base font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2Icon className="size-5 animate-spin" />
            {t("verifyOtp.submitting")}
          </>
        ) : (
          t("verifyOtp.submit")
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        disabled={cooldown > 0 || isResending}
        className="min-h-11 w-full rounded-xl"
        onClick={handleResend}
      >
        {cooldown > 0
          ? t("verifyOtp.resendIn", { seconds: cooldown })
          : t("verifyOtp.resend")}
      </Button>
    </form>
  );
}
