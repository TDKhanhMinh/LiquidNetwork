"use client";

import { use } from "react";
import { InvitationDetail } from "@/features/invitation-queue";

export default function InvitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <InvitationDetail invitationId={id} />;
}
