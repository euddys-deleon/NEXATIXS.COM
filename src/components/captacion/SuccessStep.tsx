"use client";

import { useState } from "react";
import { CalendarCheck2, CheckCircle2, Download, MessageCircle, Video } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { AppointmentBooking, type BookedAppointment } from "./AppointmentBooking";
import { generateAppointmentPdf } from "@/lib/pdf/generate-appointment-pdf";

export function SuccessStep({
  displayId,
  contactName,
  contactEmail,
  contactPhone,
  onDownloadPdf,
}: {
  displayId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  onDownloadPdf: () => void;
}) {
  const t = useTranslations("Captacion.success");
  const tBooking = useTranslations("Captacion.booking");
  const locale = useLocale();
  const [appointment, setAppointment] = useState<BookedAppointment | null>(null);

  const dateLocale = locale === "en" ? "en-US" : "es-DO";

  async function handleDownloadAppointmentPdf() {
    if (!appointment) return;
    await generateAppointmentPdf({
      displayId,
      contactName,
      executiveName: appointment.executiveName,
      scheduledAt: appointment.scheduledAt,
      channel: appointment.channel,
      locale,
    });
  }

  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
        <CheckCircle2 size={28} />
      </span>
      <span className="mt-4 block font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
        {t("badge")}
      </span>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h2>

      <div className="mx-auto mt-6 inline-block rounded-2xl border border-brand-blue/30 bg-brand-blue/5 px-8 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
          {t("idLabel")}
        </p>
        <p className="mt-1 font-heading text-2xl font-bold text-brand-blue">{displayId}</p>
      </div>
      <p className="mx-auto mt-3 max-w-sm text-sm text-foreground/60">{t("idHint")}</p>

      <div className="mt-6">
        <Button type="button" variant="outline" onClick={onDownloadPdf}>
          <Download size={16} />
          {t("downloadPdf")}
        </Button>
      </div>

      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-foreground/10 bg-background-subtle p-8 text-left">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {t("scheduleTitle")}
        </h3>
        <p className="mt-2 text-sm text-foreground/60">{t("scheduleSubtitle")}</p>

        <div className="mt-6">
          {appointment ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 text-center">
              <CalendarCheck2 className="mx-auto text-green-600" size={28} />
              <p className="mt-3 font-heading text-lg font-semibold text-foreground">
                {tBooking("confirmedTitle")}
              </p>
              <p className="mt-2 text-sm text-foreground/70">
                {tBooking("confirmedWith", { name: appointment.executiveName })}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {new Date(appointment.scheduledAt).toLocaleString(dateLocale, {
                  dateStyle: "full",
                  timeStyle: "short",
                  timeZone: "America/Santo_Domingo",
                })}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-foreground/70">
                {appointment.channel === "meet" ? (
                  <Video size={15} strokeWidth={1.75} />
                ) : (
                  <MessageCircle size={15} strokeWidth={1.75} />
                )}
                {appointment.channel === "meet"
                  ? tBooking("channelMeet")
                  : tBooking("channelWhatsapp")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleDownloadAppointmentPdf}
              >
                <Download size={15} />
                {tBooking("downloadReceipt")}
              </Button>
            </div>
          ) : (
            <AppointmentBooking
              contactName={contactName}
              contactEmail={contactEmail}
              contactPhone={contactPhone}
              onBooked={setAppointment}
            />
          )}
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium text-brand-blue hover:underline"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
