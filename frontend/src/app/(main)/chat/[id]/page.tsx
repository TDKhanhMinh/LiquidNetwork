"use client";

import { use } from "react";
import { ChatThreadScreen } from "@/features/chat";

export default function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ChatThreadScreen conversationId={id} />;
}
