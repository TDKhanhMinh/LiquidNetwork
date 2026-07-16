import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables `forbidden()` / `unauthorized()` → app/forbidden.tsx, unauthorized.tsx
    authInterrupts: true,
  },
};

export default nextConfig;
