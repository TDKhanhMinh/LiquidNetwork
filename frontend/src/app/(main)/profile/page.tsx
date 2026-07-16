"use client";

import { MyProfileScreen } from "@/features/drunk-profile";
import { LogoutButton } from "@/features/logout";

export default function ProfilePage() {
  return <MyProfileScreen footer={<LogoutButton />} />;
}
