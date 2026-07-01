"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale, useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateAccountReportPdf } from "@/lib/pdf/generate-account-report-pdf";
import { downloadCsv } from "@/lib/csv/generate-csv";

interface Project {
  name: string;
  status: string;
  progress_percent: number;
}

interface License {
  name: string;
  status: string;
  usage_percent: number | null;
}

interface Ticket {
  subject: string;
  status: string;
  priority: string;
}

export function AnalyticsReports({
  companyName,
  displayId,
  projects,
  licenses,
  tickets,
}: {
  companyName: string;
  displayId: string;
  projects: Project[];
  licenses: License[];
  tickets: Ticket[];
}) {
  const t = useTranslations("Portal.analytics");
  const tStatus = useTranslations("Portal.tickets.status");
  const locale = useLocale();

  const statusCounts: Record<string, number> = { abierto: 0, en_progreso: 0, resuelto: 0 };
  for (const ticket of tickets) {
    statusCounts[ticket.status] = (statusCounts[ticket.status] ?? 0) + 1;
  }
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: tStatus(status),
    count,
  }));

  function handleDownloadPdf() {
    generateAccountReportPdf({ companyName, displayId, locale, projects, licenses, tickets });
  }

  function handleDownloadCsv() {
    downloadCsv(
      `${displayId}-reporte.csv`,
      ["Tipo", "Nombre", "Estado", "Detalle"],
      [
        ...projects.map((p) => ["Proyecto", p.name, p.status, `${p.progress_percent}%`]),
        ...licenses.map((l) => ["Licencia", l.name, l.status, l.usage_percent != null ? `${l.usage_percent}%` : ""]),
        ...tickets.map((t) => ["Ticket", t.subject, t.status, t.priority]),
      ],
    );
  }

  return (
    <Card className="bg-background">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CardTitle>{t("title")}</CardTitle>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={handleDownloadPdf}>
            <Download size={14} />
            {t("downloadPdf")}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleDownloadCsv}>
            <Download size={14} />
            {t("downloadCsv")}
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm text-foreground/60">{t("subtitle")}</p>

      <div className="mt-6 h-56">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          {t("ticketsByStatus")}
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis dataKey="status" stroke="currentColor" fontSize={12} />
            <YAxis allowDecimals={false} stroke="currentColor" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "var(--color-background)",
                border: "1px solid rgba(128,128,128,0.2)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" fill="#0e6eff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
