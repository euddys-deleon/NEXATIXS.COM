import { jsPDF } from "jspdf";

interface AccountReportInput {
  companyName: string;
  displayId: string;
  locale: string;
  projects: { name: string; status: string; progress_percent: number }[];
  licenses: { name: string; status: string; usage_percent: number | null }[];
  tickets: { subject: string; status: string; priority: string }[];
}

const COPY = {
  es: {
    heading: "Reporte de Cuenta",
    account: "Cuenta",
    id: "ID",
    date: "Fecha del reporte",
    projects: "Proyectos",
    licenses: "Licencias",
    tickets: "Tickets",
    noData: "Sin registros.",
  },
  en: {
    heading: "Account Report",
    account: "Account",
    id: "ID",
    date: "Report date",
    projects: "Projects",
    licenses: "Licenses",
    tickets: "Tickets",
    noData: "No records.",
  },
};

export function generateAccountReportPdf({
  companyName,
  displayId,
  locale,
  projects,
  licenses,
  tickets,
}: AccountReportInput) {
  const copy = locale === "en" ? COPY.en : COPY.es;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("NEXATIXS", marginX, y);
  y += 24;
  doc.setFontSize(14);
  doc.text(copy.heading, marginX, y);

  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${copy.account}: ${companyName}`, marginX, y);
  y += 16;
  doc.text(`${copy.id}: ${displayId}`, marginX, y);
  y += 16;
  doc.text(
    `${copy.date}: ${new Date().toLocaleString(locale === "en" ? "en-US" : "es-DO")}`,
    marginX,
    y,
  );

  function section(title: string, rows: string[]) {
    y += 28;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, marginX, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (rows.length === 0) {
      doc.text(copy.noData, marginX, y);
      y += 14;
      return;
    }
    for (const row of rows) {
      if (y > 760) {
        doc.addPage();
        y = 64;
      }
      doc.text(`- ${row}`, marginX, y);
      y += 14;
    }
  }

  section(
    copy.projects,
    projects.map((project) => `${project.name} — ${project.status} (${project.progress_percent}%)`),
  );
  section(
    copy.licenses,
    licenses.map(
      (license) => `${license.name} — ${license.status}${license.usage_percent != null ? ` (${license.usage_percent}%)` : ""}`,
    ),
  );
  section(
    copy.tickets,
    tickets.map((ticket) => `${ticket.subject} — ${ticket.status} (${ticket.priority})`),
  );

  doc.save(`${displayId}-reporte.pdf`);
}
