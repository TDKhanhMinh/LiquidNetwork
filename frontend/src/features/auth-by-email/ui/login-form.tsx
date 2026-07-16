"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { useLogin } from "../model/use-login";

/**
 * Skeleton login form — style and fields can grow with product design.
 */
export function LoginForm() {
  const { t, ready } = useAppTranslation(["auth", "error"]);
  const { login, isLoading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login({ email, password });
    } catch {
      // error is already in hook state
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <h2 className="text-lg font-semibold">{ready ? t("login.title") : "…"}</h2>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t("login.email")}</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t("login.password")}</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isLoading || !ready}>
        {isLoading ? t("login.submitting") : t("login.submit")}
      </Button>
    </form>
  );
}
