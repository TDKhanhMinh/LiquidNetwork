import { AuthShell } from "@/features/auth-by-email";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
