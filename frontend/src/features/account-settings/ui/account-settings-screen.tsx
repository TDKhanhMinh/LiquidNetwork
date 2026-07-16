"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { userApi, userKeys } from "@/entities/user";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useUpdatePrivacy } from "../hook/use-update-privacy";

const NOTIF_KEY = "ln.notif_prefs";

type NotifPrefs = {
  push: boolean;
  email: boolean;
  inApp: boolean;
};

function readNotifPrefs(): NotifPrefs {
  if (typeof window === "undefined") {
    return { push: true, email: false, inApp: true };
  }
  try {
    const raw = window.localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw) as NotifPrefs;
  } catch {
    // ignore
  }
  return { push: true, email: false, inApp: true };
}

function writeNotifPrefs(prefs: NotifPrefs) {
  try {
    window.localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function AccountSettingsScreen() {
  const { t, ready } = useAppTranslation(["user", "common"]);
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: userKeys.me(),
    queryFn: () => userApi.getMe(),
  });
  const updatePrivacy = useUpdatePrivacy();

  const [hideProfile, setHideProfile] = useState(false);
  const [hideLevel, setHideLevel] = useState(false);
  const [notifs, setNotifs] = useState<NotifPrefs>({
    push: true,
    email: false,
    inApp: true,
  });

  useEffect(() => {
    if (!user) return;
    setHideProfile(user.privacySettings?.hideProfile ?? false);
    setHideLevel(user.privacySettings?.hideLevel ?? false);
  }, [user]);

  useEffect(() => {
    setNotifs(readNotifPrefs());
  }, []);

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !user) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  async function patchPrivacy(next: {
    hideProfile?: boolean;
    hideLevel?: boolean;
  }) {
    await updatePrivacy.mutateAsync(next);
  }

  return (
    <div className="page-shell gap-6 md:gap-7">
      <header className="space-y-1">
        <h1 className="page-title">
          {t("settings.title")}
        </h1>
        <p className="page-subtitle">{t("settings.subtitle")}</p>
      </header>

      {/* Security (read-only info for now) */}
      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">{t("settings.security")}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{t("fields.email")}</span>
            <span className="font-medium">{user.email || "—"}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{t("fields.phone")}</span>
            <span className="font-medium">{user.phone || "—"}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("settings.securityHint")}
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{t("settings.privacy")}</h2>
          {updatePrivacy.isPending ? (
            <Loader2Icon className="size-4 animate-spin text-primary" />
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <Label htmlFor="hide-profile">{t("settings.hideProfile")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("settings.hideProfileHint")}
            </p>
          </div>
          <Switch
            id="hide-profile"
            checked={hideProfile}
            onCheckedChange={(checked) => {
              setHideProfile(checked);
              void patchPrivacy({ hideProfile: checked, hideLevel });
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <Label htmlFor="hide-level">{t("settings.hideLevel")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("settings.hideLevelHint")}
            </p>
          </div>
          <Switch
            id="hide-level"
            checked={hideLevel}
            onCheckedChange={(checked) => {
              setHideLevel(checked);
              void patchPrivacy({ hideProfile, hideLevel: checked });
            }}
          />
        </div>
      </section>

      {/* Notifications (local prefs until backend) */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">{t("settings.notifications")}</h2>
        {(
          [
            ["push", t("settings.notifPush")],
            ["email", t("settings.notifEmail")],
            ["inApp", t("settings.notifInApp")],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <Label htmlFor={`notif-${key}`}>{label}</Label>
            <Switch
              id={`notif-${key}`}
              checked={notifs[key]}
              onCheckedChange={(checked) => {
                const next = { ...notifs, [key]: checked };
                setNotifs(next);
                writeNotifPrefs(next);
              }}
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          {t("settings.notifHint")}
        </p>
      </section>
    </div>
  );
}
