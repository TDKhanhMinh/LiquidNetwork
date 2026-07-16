"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { Toaster } from "@/shared/ui/sonner";
import { initI18n } from "@/shared/i18n";
import { getQueryClient } from "@/shared/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  // Stable client for the browser session (SSR gets a fresh one via getQueryClient)
  const [queryClient] = useState(() => getQueryClient());

  useEffect(() => {
    void initI18n();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
