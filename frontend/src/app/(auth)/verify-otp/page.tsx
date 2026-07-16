"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VerifyOtpForm } from "@/features/auth-by-phone";
import { AuthGate } from "@/features/auth-guard";
import type { OtpPurpose } from "@/entities/session";
import {
  Card,
  CardContent,
} from "@/shared/ui/card";
import { PageLoading } from "@/widgets/page-state";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const purpose = (searchParams.get("purpose") as OtpPurpose) || "login";
  const name = searchParams.get("name") ?? undefined;

  return (
    <Card className="w-full rounded-2xl border-border bg-card py-0 shadow-amber-glow ring-1 ring-primary/15">
      <CardContent className="px-5 py-6 md:px-6">
        <VerifyOtpForm phone={phone} purpose={purpose} name={name} />
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthGate mode="public">
      <Suspense fallback={<PageLoading compact />}>
        <VerifyOtpContent />
      </Suspense>
    </AuthGate>
  );
}
