/**
 * Public marketing shell — no app header / bottom nav.
 * First-visit experience for LiquidNetwork landing.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#0B0F19]">
      {children}
    </div>
  );
}
