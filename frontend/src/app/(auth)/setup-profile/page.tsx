"use client";

import { AuthGate } from "@/features/auth-guard";
import { SetupProfileForm } from "@/features/setup-profile";

export default function SetupProfilePage() {
  return (
    <AuthGate mode="setup-profile">
      <SetupProfileForm />
    </AuthGate>
  );
}
