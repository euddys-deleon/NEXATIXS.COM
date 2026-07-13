"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck2, MessageCircle, Video } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30; // 08:00 to 17:30, Santo Domingo time
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
});

function todayIsoDate() {
  // "Today" from the business's fixed timezone (America/Santo_Domingo, UTC-4, no DST),
  // not the visitor's local clock — keeps the min-date bound consistent for everyone.
  const nowUtc = Date.now();
  const santoDomingo = new Date(nowUtc - 4 * 60 * 60 * 1000);
  return santoDomingo.toISOString().slice(0, 10);
}

export type BookedAppointment = {
  executiveName: string;
  scheduledAt: string;
  channel: "meet" | "whatsapp";
};

export function AppointmentBooking({
  contactName,
  contactEmail,
  contactPhone,
  onBooked,
}: {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  onBooked: (appointment: BookedAppointment) => void;
}) {
  const t = useTranslations("Captacion.booking");

  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [channel, setChannel] = useState<"meet" | "whatsapp">("meet");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!date) {
      setError(t("errorMissingDate"));
      return;
    }
    setSubmitting(true);
    setError(null);

    // Fixed -04:00 offset: business hours are always Santo Domingo local time,
    // regardless of the visitor's own browser timezone.
    const scheduledAt = new Date(`${date}T${time}:00-04:00`);

    const { data, error: rpcError } = await supabase.rpc("book_appointment", {
      // p_prospect_id / p_contact_phone son NULL-ables en la base de datos; los tipos
      // generados los marcan como `string` porque el generador de Supabase no infiere
      // nullability de argumentos de funcion, de ahi el cast explicito.
      p_prospect_id: null as unknown as string,
      p_contact_name: contactName,
      p_contact_email: contactEmail,
      p_contact_phone: (contactPhone || null) as unknown as string,
      p_channel: channel,
      p_scheduled_at: scheduledAt.toISOString(),
      p_duration_minutes: 30,
    });

    setSubmitting(false);

    if (rpcError || !data) {
      const message = rpcError?.message ?? "";
      if (message.includes("SLOT_UNAVAILABLE")) setError(t("errorSlotUnavailable"));
      else if (message.includes("OUTSIDE_BUSINESS_HOURS")) setError(t("errorOutsideHours"));
      else if (message.includes("INVALID_TIME")) setError(t("errorPastTime"));
      else setError(t("errorGeneric"));
      return;
    }

    const result = data as { executive_name: string; scheduled_at: string; channel: string };
    onBooked({
      executiveName: result.executive_name,
      scheduledAt: result.scheduled_at,
      channel: result.channel as "meet" | "whatsapp",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("dateLabel")} htmlFor="appointment-date">
          <Input
            id="appointment-date"
            type="date"
            required
            min={todayIsoDate()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
        <Field label={t("timeLabel")} htmlFor="appointment-time">
          <Select id="appointment-time" value={time} onChange={(event) => setTime(event.target.value)}>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <p className="text-xs text-foreground/50">{t("businessHoursHint")}</p>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t("channelLabel")}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setChannel("meet")}
            className={cn(
              "flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors",
              channel === "meet"
                ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                : "border-foreground/15 text-foreground/70 hover:border-foreground/30",
            )}
          >
            <Video size={18} strokeWidth={1.75} />
            {t("channelMeet")}
          </button>
          <button
            type="button"
            onClick={() => setChannel("whatsapp")}
            className={cn(
              "flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors",
              channel === "whatsapp"
                ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                : "border-foreground/15 text-foreground/70 hover:border-foreground/30",
            )}
          >
            <MessageCircle size={18} strokeWidth={1.75} />
            {t("channelWhatsapp")}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        <CalendarCheck2 size={18} />
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
