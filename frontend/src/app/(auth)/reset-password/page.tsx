"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGate } from "@/features/auth-guard";
import { ResetPasswordForm } from "@/features/auth-password";
import { PageLoading } from "@/widgets/page-state";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <AuthGate mode="public">
      <Suspense fallback={<PageLoading compact />}>
        <ResetPasswordContent />
      </Suspense>
    </AuthGate>
  );
}
