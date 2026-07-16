"use client";

import { use } from "react";
import { SessionDetailScreen } from "@/features/drinking-session";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SessionDetailScreen sessionId={id} />;
}
