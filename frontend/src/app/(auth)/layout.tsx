import { AuthShell } from "@/features/auth-by-email";
import { AppFrame } from "@/shared/ui/app-frame";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppFrame>
      <AuthShell>{children}</AuthShell>
    </AppFrame>
  );
}
