"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import type { OtpPurpose } from "@/entities/session";
import { env, routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { isValidVnPhone, normalizeVnPhone } from "@/shared/lib/phone";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useSendPhoneOtp } from "../hook/use-send-phone-otp";

interface PhoneLoginFormProps {
  purpose?: OtpPurpose;
  /** Optional name for register flow (stored in query) */
  name?: string;
  className?: string;
  compact?: boolean;
}

export function PhoneLoginForm({
  purpose = "login",
  name,
  className,
  compact,
}: PhoneLoginFormProps) {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["auth", "error", "common"]);
  const { sendOtp, isLoading, error } = useSendPhoneOtp();
  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    const normalized = normalizeVnPhone(phone);
    if (!isValidVnPhone(normalized)) {
      setLocalError(t("phone.invalidPhone"));
      return;
    }

    try {
      await sendOtp(normalized, purpose);
      const params = new URLSearchParams({
        phone: normalized,
        purpose,
      });
      if (name?.trim()) params.set("name", name.trim());
      router.push(`${routes.verifyOtp}?${params.toString()}`);
    } catch {
      // error in hook
    }
  }

  const displayError = localError ?? error;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      {!compact ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("phone.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("phone.subtitle")}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone-login" className="text-[13px]">
          {t("phone.phone")}
        </Label>
        <Input
          id="phone-login"
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phone.phonePlaceholder")}
          className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base"
          aria-invalid={Boolean(displayError) || undefined}
        />
      </div>

      {env.authMock ? (
        <p className="text-xs text-primary/90">{t("phone.mockHint")}</p>
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
        disabled={isLoading || !ready}
        className="min-h-12 w-full rounded-xl text-base font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2Icon className="size-5 animate-spin" />
            {t("phone.sending")}
          </>
        ) : (
          t("phone.sendOtp")
        )}
      </Button>
    </form>
  );
}
