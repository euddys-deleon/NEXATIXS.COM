import { jsPDF } from "jspdf";

interface ProspectPdfInput {
  displayId: string;
  formTypeLabel: string;
  categoryLabel: string;
  fields: { label: string; value: string }[];
  locale: string;
}

const COPY = {
  es: {
    tagline: "Tecnología • Integración • Innovación",
    heading: "Comprobante de Solicitud",
    id: "ID único",
    formType: "Tipo de formulario",
    category: "Categoría",
    date: "Fecha",
    dataTitle: "Datos suministrados",
  },
  en: {
    tagline: "Technology • Integration • Innovation",
    heading: "Request Receipt",
    id: "Unique ID",
    formType: "Form type",
    category: "Category",
    date: "Date",
    dataTitle: "Submitted information",
  },
};

export function generateProspectPdf({
  displayId,
  formTypeLabel,
  categoryLabel,
  fields,
  locale,
}: ProspectPdfInput) {
  const copy = locale === "en" ? COPY.en : COPY.es;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const maxWidth = 500;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("NEXATIXS", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text(copy.tagline, marginX, y);

  y += 30;
  doc.setDrawColor(14, 110, 255);
  doc.setLineWidth(1);
  doc.line(marginX, y, 548, y);

  y += 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(copy.heading, marginX, y);

  y += 24;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${copy.id}: ${displayId}`, marginX, y);
  y += 16;
  doc.text(`${copy.formType}: ${formTypeLabel}`, marginX, y);
  y += 16;
  doc.text(`${copy.category}: ${categoryLabel}`, marginX, y);
  y += 16;
  doc.text(`${copy.date}: ${new Date().toLocaleString(locale === "en" ? "en-US" : "es-DO")}`, marginX, y);

  y += 26;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, 548, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.text(copy.dataTitle, marginX, y);
  y += 20;
  doc.setFont("helvetica", "normal");

  for (const field of fields) {
    if (y > 760) {
      doc.addPage();
      y = 64;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(field.label, marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(field.value || "-", maxWidth);
    doc.text(lines, marginX, y);
    y += lines.length * 14 + 10;
  }

  doc.save(`${displayId}.pdf`);
}
