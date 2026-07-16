import type { Metadata } from "next";
import { LandingPage } from "@/widgets/landing-page";

export const metadata: Metadata = {
  title: "LiquidNetwork — Thoải mái hơn khi mời bạn bè giao lưu",
  description:
    "Sequential Invite Queue, Hồ sơ giao lưu, Chỉ số phù hợp và Đồng hành về nhà. Super App cho văn hóa gặp gỡ Việt — trật tự, an toàn, thoải mái.",
  openGraph: {
    title: "LiquidNetwork — Super App",
    description:
      "Mời tuần tự, gặp gỡ đúng gu, về nhà an toàn. LiquidNetwork Super App.",
  },
};

/**
 * Public landing at `/`. Authenticated users should use app home `/home`.
 */
export default function MarketingHomePage() {
  return <LandingPage />;
}
