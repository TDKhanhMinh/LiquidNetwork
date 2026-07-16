"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { userApi, userKeys } from "@/entities/user";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  PageErrorInline,
  PageLoading,
  PageSuccess,
} from "@/widgets/page-state";
import {
  useUpdateBasicInfo,
  useUpdateDrunkProfile,
} from "../hook/use-update-drunk-profile";

export function EditDrunkProfileForm() {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["user", "common", "error"]);
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: userKeys.me(),
    queryFn: () => userApi.getMe(),
  });
  const updateBasic = useUpdateBasicInfo();
  const updateDrunk = useUpdateDrunkProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [selfIntroduction, setSelfIntroduction] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setBio(user.bio ?? "");
    setOccupation(user.drunkProfile?.occupation ?? "");
    setEducation(user.drunkProfile?.education ?? "");
    setSelfIntroduction(user.drunkProfile?.selfIntroduction ?? "");
  }, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setDone(false);
    try {
      await updateBasic.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      await updateDrunk.mutateAsync({
        drunkProfile: {
          occupation: occupation.trim() || undefined,
          education: education.trim() || undefined,
          selfIntroduction: selfIntroduction.trim() || undefined,
        },
      });
      setDone(true);
    } catch {
      // toast
    }
  }

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !user) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (done) {
    return (
      <PageSuccess
        title={t("edit.successTitle")}
        description={t("edit.successBody")}
        action={
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => router.replace(routes.profile)}
          >
            {t("profile.title")}
          </Button>
        }
      />
    );
  }

  const pending = updateBasic.isPending || updateDrunk.isPending;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("edit.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("edit.subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-name">{t("fields.name")}</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 min-h-11 rounded-xl border-border bg-muted/40 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-phone">{t("fields.phone")}</Label>
          <Input
            id="edit-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 min-h-11 rounded-xl border-border bg-muted/40 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-bio">{t("fields.bio")}</Label>
          <Textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-20 rounded-xl border-border bg-muted/40 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-occupation">{t("fields.occupation")}</Label>
          <Input
            id="edit-occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder={t("edit.placeholders.occupation")}
            className="h-12 min-h-11 rounded-xl border-border bg-muted/40 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-education">{t("fields.education")}</Label>
          <Input
            id="edit-education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder={t("edit.placeholders.education")}
            className="h-12 min-h-11 rounded-xl border-border bg-muted/40 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-intro">{t("fields.selfIntroduction")}</Label>
          <Textarea
            id="edit-intro"
            value={selfIntroduction}
            onChange={(e) => setSelfIntroduction(e.target.value)}
            placeholder={t("edit.placeholders.selfIntroduction")}
            className="min-h-28 rounded-xl border-border bg-muted/40 text-base"
          />
        </div>

        <Button
          type="submit"
          disabled={pending || !name.trim()}
          className="min-h-12 rounded-xl text-base font-semibold"
        >
          {pending ? (
            <>
              <Loader2Icon className="animate-spin" />
              {t("edit.saving")}
            </>
          ) : (
            t("edit.save")
          )}
        </Button>
      </form>
    </div>
  );
}
