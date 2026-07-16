import { AuthGate } from "@/features/auth-guard";
import { MaintenanceGate } from "@/features/maintenance";
import { AppFrame } from "@/shared/ui/app-frame";
import { AppShell } from "@/widgets/app-shell";
import { BottomNav } from "@/widgets/bottom-nav";
import { Header } from "@/widgets/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate mode="app">
      <MaintenanceGate>
        <AppFrame>
          <AppShell header={<Header />} bottomNav={<BottomNav />}>
            {children}
          </AppShell>
        </AppFrame>
      </MaintenanceGate>
    </AuthGate>
  );
}
