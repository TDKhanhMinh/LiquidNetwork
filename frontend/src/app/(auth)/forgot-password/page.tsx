"use client";

import { AuthGate } from "@/features/auth-guard";
import { ForgotPasswordForm } from "@/features/auth-password";

export default function ForgotPasswordPage() {
  return (
    <AuthGate mode="guest">
      <ForgotPasswordForm />
    </AuthGate>
  );
}
