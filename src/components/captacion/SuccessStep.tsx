"use client";

import { CheckCircle2, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export function SuccessStep({
  displayId,
  onDownloadPdf,
}: {
  displayId: string;
  onDownloadPdf: () => void;
}) {
  const t = useTranslations("Captacion.success");
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

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

        {calendlyUrl ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-foreground/10">
            <iframe src={calendlyUrl} className="h-[600px] w-full" title="Calendly" />
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-foreground/20 p-4 text-sm text-foreground/60">
            {t("calendlyPending")}
          </p>
        )}
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
