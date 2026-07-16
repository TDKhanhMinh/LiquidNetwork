"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { useCreateSession } from "../hook/use-sessions";

const DEMO_INVITEES = ["u-minh", "u-lan", "u-ha", "u-huy"];

export function CreateSessionForm() {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["drinking-session", "common"]);
  const create = useCreateSession();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState("");
  const [invitees, setInvitees] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  function toggleInvitee(id: string) {
    setInvitees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (!title.trim() || !location.trim()) {
      setLocalError(t("form.validation.required"));
      return;
    }
    try {
      const session = await create.mutateAsync({
        title: title.trim(),
        location: location.trim(),
        maxParticipants,
        startTime: new Date(startTime).toISOString(),
        note: note.trim() || undefined,
        inviteeIds: invitees,
      });
      router.replace(routes.sessionDetail(session.id));
    } catch {
      // toast
    }
  }

  if (!ready) return null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("form.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("form.subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-title">{t("form.fields.title")}</Label>
          <Input
            id="s-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-12 min-h-11 rounded-xl"
            placeholder={t("form.placeholders.title")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="s-loc">{t("form.fields.location")}</Label>
          <Input
            id="s-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="h-12 min-h-11 rounded-xl"
            placeholder={t("form.placeholders.location")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="s-start">{t("form.fields.startTime")}</Label>
          <Input
            id="s-start"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="h-12 min-h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="s-max">{t("form.fields.maxParticipants")}</Label>
          <Input
            id="s-max"
            type="number"
            min={1}
            max={20}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value) || 1)}
            className="h-12 min-h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="s-note">{t("form.fields.note")}</Label>
          <Textarea
            id="s-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-20 rounded-xl"
            placeholder={t("form.placeholders.note")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("form.fields.invite")}</Label>
          <div className="flex flex-wrap gap-2">
            {DEMO_INVITEES.map((id) => {
              const on = invitees.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleInvitee(id)}
                  className={
                    on
                      ? "min-h-10 rounded-xl border border-primary bg-primary/15 px-3 text-xs font-medium text-primary"
                      : "min-h-10 rounded-xl border border-border px-3 text-xs font-medium text-muted-foreground"
                  }
                >
                  {id.replace("u-", "")}
                </button>
              );
            })}
          </div>
        </div>

        {localError ? (
          <p role="alert" className="text-sm text-destructive">
            {localError}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={create.isPending}
          className="min-h-12 rounded-xl text-base font-semibold"
        >
          {create.isPending ? (
            <>
              <Loader2Icon className="animate-spin" />
              {t("form.submitting")}
            </>
          ) : (
            t("form.submit")
          )}
        </Button>
      </form>
    </div>
  );
}
