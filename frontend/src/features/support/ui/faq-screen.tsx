"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useFaq } from "../hook/use-support";

export function FaqScreen() {
  const { t, ready } = useAppTranslation("support");
  const { data, isLoading, isError, refetch } = useFaq();

  if (!ready || isLoading) return <PageLoading />;
  if (isError) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const items = data ?? [];

  return (
    <div className="page-shell gap-4 md:gap-5">
      <header className="space-y-1">
        <h1 className="page-title">{t("faq.title")}</h1>
        <p className="page-subtitle">{t("faq.subtitle")}</p>
      </header>

      <Accordion className="w-full">
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left text-sm font-medium">
              <span className="flex flex-col items-start gap-0.5">
                <span className="text-[10px] font-medium tracking-wide text-primary uppercase">
                  {item.category}
                </span>
                {item.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="page-subtitle">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
