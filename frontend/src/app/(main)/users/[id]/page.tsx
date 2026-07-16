"use client";

import { use } from "react";
import { PublicProfileScreen } from "@/features/drunk-profile";

export default function PublicUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PublicProfileScreen userId={id} />;
}
