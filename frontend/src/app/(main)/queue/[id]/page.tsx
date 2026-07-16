"use client";

import { use } from "react";
import { QueueLiveScreen } from "@/features/invitation-queue";

export default function QueueLivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <QueueLiveScreen queueId={id} />;
}
