"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { env } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { getPostAuthPath } from "@/shared/lib/post-auth-path";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useGoogleLogin } from "../hook/use-google-login";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

const GIS_SCRIPT = "https://accounts.google.com/gsi/client";

function loadGisScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${GIS_SCRIPT}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

interface SocialAuthButtonsProps {
  className?: string;
}

/**
 * Social login row. Google uses GIS when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set.
 * Apple / Facebook shown as disabled placeholders until backend is ready.
 */
export function SocialAuthButtons({ className }: SocialAuthButtonsProps) {
  const router = useRouter();
  const { t, ready } = useAppTranslation("auth");
  const { loginWithGoogleToken, isLoading, error, setError } = useGoogleLogin();
  const [gisReady, setGisReady] = useState(false);
  const initializing = useRef(false);
  const clientId = env.googleClientId;

  const handleCredential = useCallback(
    async (credential?: string) => {
      if (!credential) return;
      try {
        await loginWithGoogleToken(credential);
        router.replace(getPostAuthPath());
      } catch {
        // hook error
      }
    },
    [loginWithGoogleToken, router],
  );

  useEffect(() => {
    if (!clientId || initializing.current) return;
    initializing.current = true;

    void loadGisScript()
      .then(() => {
        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => {
            void handleCredential(res.credential);
          },
        });
        setGisReady(true);
      })
      .catch(() => {
        setError(t("social.googleUnavailable"));
      });
  }, [clientId, handleCredential, setError, t]);

  function handleGoogleClick() {
    if (!clientId) {
      setError(t("social.googleUnavailable"));
      return;
    }
    if (!gisReady || !window.google?.accounts?.id) {
      setError(t("social.googleUnavailable"));
      return;
    }
    window.google.accounts.id.prompt();
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            {ready ? t("login.orContinue") : "…"}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="min-h-12 w-full rounded-xl font-medium"
        disabled={isLoading || !ready}
        onClick={handleGoogleClick}
      >
        {isLoading ? (
          <>
            <Loader2Icon className="size-5 animate-spin" />
            {t("social.googleLoading")}
          </>
        ) : (
          <>
            <GoogleGlyph />
            {t("social.google")}
          </>
        )}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled
          className="min-h-11 rounded-xl text-xs opacity-60"
          title={t("social.comingSoon")}
        >
          {t("social.apple")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled
          className="min-h-11 rounded-xl text-xs opacity-60"
          title={t("social.comingSoon")}
        >
          {t("social.facebook")}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.9 0 8.5-4.8 8.5-7.3 0-.5 0-.9-.1-1.3H12z"
      />
    </svg>
  );
}
