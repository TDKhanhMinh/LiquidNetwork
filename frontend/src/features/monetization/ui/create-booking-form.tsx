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
import { useCreateBooking } from "../hook/use-monetization";

export function CreateBookingForm() {
  const router = useRouter();
  const { t, ready } = useAppTranslation("monetization");
  const create = useCreateBooking();
  const [venueName, setVenueName] = useState("Bia Craft Q1");
  const [address, setAddress] = useState("Nguyễn Huệ, Q1, HCMC");
  const [partySize, setPartySize] = useState(4);
  const [reservedAt, setReservedAt] = useState(() => {
    const d = new Date(Date.now() + 24 * 3600_000);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (!venueName.trim() || !address.trim()) {
      setLocalError(t("bookings.validation"));
      return;
    }
    try {
      await create.mutateAsync({
        venueName: venueName.trim(),
        address: address.trim(),
        partySize,
        reservedAt: new Date(reservedAt).toISOString(),
        note: note.trim() || undefined,
      });
      router.replace(routes.bookings);
    } catch {
      // toast
    }
  }

  if (!ready) return null;

  return (
    <div className="page-shell gap-5 md:gap-6">
      <header className="space-y-1">
        <h1 className="page-title">
          {t("bookings.createTitle")}
        </h1>
        <p className="page-subtitle">
          {t("bookings.createSubtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="v-name">{t("bookings.fields.venue")}</Label>
          <Input
            id="v-name"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="h-12 min-h-11 rounded-xl"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="v-addr">{t("bookings.fields.address")}</Label>
          <Input
            id="v-addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-12 min-h-11 rounded-xl"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="v-size">{t("bookings.fields.partySize")}</Label>
          <Input
            id="v-size"
            type="number"
            min={1}
            max={30}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value) || 1)}
            className="h-12 min-h-11 rounded-xl"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="v-time">{t("bookings.fields.time")}</Label>
          <Input
            id="v-time"
            type="datetime-local"
            value={reservedAt}
            onChange={(e) => setReservedAt(e.target.value)}
            className="h-12 min-h-11 rounded-xl"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="v-note">{t("bookings.fields.note")}</Label>
          <Textarea
            id="v-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-20 rounded-xl"
          />
        </div>
        {localError ? (
          <p className="text-sm text-destructive">{localError}</p>
        ) : null}
        <Button
          type="submit"
          disabled={create.isPending}
          className="min-h-12 rounded-xl"
        >
          {create.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          {t("bookings.submit")}
        </Button>
      </form>
    </div>
  );
}
