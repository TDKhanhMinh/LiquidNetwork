"use client";

import { useState } from "react";
import Link from "next/link";
import { RegisterForm } from "@/features/auth-by-email";
import { PhoneLoginForm } from "@/features/auth-by-phone";
import { SocialAuthButtons } from "@/features/auth-by-social";
import { AuthGate } from "@/features/auth-guard";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

function RegisterPageContent() {
  const { t, ready } = useAppTranslation(["auth", "common"]);
  const [phoneName, setPhoneName] = useState("");

  return (
    <Card className="w-full rounded-2xl border-border bg-card py-0 shadow-amber-glow ring-1 ring-primary/15">
      <CardHeader className="gap-2 border-b border-border/60 px-5 pt-6 pb-5 md:px-6">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          LiquidNetwork
        </p>
        <CardTitle className="text-2xl font-semibold tracking-tight md:text-[1.65rem]">
          {ready ? t("register.title") : "…"}
        </CardTitle>
        <CardDescription className="text-[15px] leading-relaxed text-muted-foreground">
          {t("register.subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pt-5 md:px-6">
        <Tabs defaultValue="email" className="w-full gap-4">
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-muted p-1">
            <TabsTrigger
              value="email"
              className="rounded-lg data-active:bg-background"
            >
              {t("register.tabEmail")}
            </TabsTrigger>
            <TabsTrigger
              value="phone"
              className="rounded-lg data-active:bg-background"
            >
              {t("register.tabPhone")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4 outline-none">
            <RegisterForm embedded />
          </TabsContent>

          <TabsContent value="phone" className="mt-4 space-y-4 outline-none">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-phone-name" className="text-[13px]">
                {t("register.name")}
              </Label>
              <Input
                id="reg-phone-name"
                value={phoneName}
                onChange={(e) => setPhoneName(e.target.value)}
                placeholder={t("register.namePlaceholder")}
                className="h-12 min-h-11 rounded-xl border-border bg-muted/40 px-3.5 text-base"
              />
            </div>
            <PhoneLoginForm
              purpose="register"
              name={phoneName}
              compact
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <SocialAuthButtons />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/60 px-5 py-5 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          {t("register.hasAccount")}{" "}
          <Link
            href={routes.login}
            className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("register.goLogin")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <AuthGate mode="guest">
      <RegisterPageContent />
    </AuthGate>
  );
}
