"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { useLogout } from "../hook/use-logout";

interface LogoutButtonProps {
  onLoggedOut?: () => void;
}

export function LogoutButton({ onLoggedOut }: LogoutButtonProps) {
  const router = useRouter();
  const { t } = useAppTranslation("auth");
  const { logout, isLoading } = useLogout();

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 w-full rounded-xl"
      disabled={isLoading}
      onClick={async () => {
        try {
          await logout();
          onLoggedOut?.();
          router.replace(routes.landing);
        } catch {
          // tokens cleared in finally of sessionApi; still leave protected area
          router.replace(routes.login);
        }
      }}
    >
      {isLoading ? t("logout.submitting") : t("logout.submit")}
    </Button>
  );
}
