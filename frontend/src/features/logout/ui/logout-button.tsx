"use client";

import { Button } from "@/shared/ui/button";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { useLogout } from "../model/use-logout";

interface LogoutButtonProps {
  onLoggedOut?: () => void;
}

export function LogoutButton({ onLoggedOut }: LogoutButtonProps) {
  const { t } = useAppTranslation("auth");
  const { logout, isLoading } = useLogout();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoading}
      onClick={async () => {
        try {
          await logout();
          onLoggedOut?.();
        } catch {
          // surfaced via hook if needed
        }
      }}
    >
      {isLoading ? t("logout.submitting") : t("logout.submit")}
    </Button>
  );
}
