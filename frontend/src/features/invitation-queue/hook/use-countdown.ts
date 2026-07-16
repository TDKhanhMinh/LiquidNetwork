"use client";

import { useEffect, useState } from "react";

export function useCountdown(expiresAt?: string | null) {
  const [remainingMs, setRemainingMs] = useState(() =>
    expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0,
  );

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      setRemainingMs(
        Math.max(0, new Date(expiresAt).getTime() - Date.now()),
      );
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isExpired = Boolean(expiresAt) && remainingMs <= 0;

  return { remainingMs, totalSeconds, label, isExpired };
}
