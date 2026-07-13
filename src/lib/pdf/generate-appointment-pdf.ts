import { GState, jsPDF } from "jspdf";

interface AppointmentPdfInput {
  displayId: string;
  contactName: string;
  executiveName: string;
  scheduledAt: string;
  channel: "meet" | "whatsapp";
  locale: string;
}

const PARTNERS = [
  { name: "Brayam Herrera Peralta", title: "Co-Founder / CTO" },
  { name: "Euddys Daviel De León Feliz", title: "Co-Founder / CISO" },
  { name: "Yohan Matos", title: "Co-Founder / COO" },
];

const COPY = {
  es: {
    tagline: "Tecnología • Integración • Innovación",
    heading: "Comprobante de Cita",
    id: "ID de solicitud",
    contact: "Solicitante",
    executive: "Ejecutivo asignado",
    dateTime: "Fecha y hora",
    channel: "Canal de reunión",
    channelMeet: "Google Meet",
    channelWhatsapp: "WhatsApp",
    issued: "Emitido",
    signaturesTitle: "Firmado electrónicamente por la dirección de NEXATIXS",
    footerNote: "Este comprobante confirma su cita con NEXATIXS. Recibirá los detalles de acceso a la reunión por correo electrónico.",
  },
  en: {
    tagline: "Technology • Integration • Innovation",
    heading: "Appointment Receipt",
    id: "Request ID",
    contact: "Requested by",
    executive: "Assigned executive",
    dateTime: "Date and time",
    channel: "Meeting channel",
    channelMeet: "Google Meet",
    channelWhatsapp: "WhatsApp",
    issued: "Issued",
    signaturesTitle: "Electronically signed by NEXATIXS leadership",
    footerNote: "This receipt confirms your appointment with NEXATIXS. Meeting access details will follow by email.",
  },
};

async function loadImageAsDataUrl(src: string): Promise<string | null> {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateAppointmentPdf({
  displayId,
  contactName,
  executiveName,
  scheduledAt,
  channel,
  locale,
}: AppointmentPdfInput) {
  const copy = locale === "en" ? COPY.en : COPY.es;
  const dateLocale = locale === "en" ? "en-US" : "es-DO";
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 56;
  const contentWidth = pageWidth - marginX * 2;

  // Translucent diagonal watermark, drawn first so all other content sits above it.
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.06 }));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(72);
  doc.setTextColor(14, 110, 255);
  doc.text("NEXATIXS", pageWidth / 2, pageHeight / 2, { angle: 35, align: "center" });
  doc.restoreGraphicsState();

  let y = 64;

  const logoDataUrl = await loadImageAsDataUrl("/assets/brand/logo/mark-transparent-light.png");
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", marginX, y - 28, 34, 34);
  }

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("NEXATIXS", marginX + (logoDataUrl ? 44 : 0), y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(copy.tagline, marginX + (logoDataUrl ? 44 : 0), y + 14);

  y += 40;
  doc.setDrawColor(14, 110, 255);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 40;
  doc.setTextColor(14, 110, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(copy.heading, marginX, y);

  y += 36;
  const rows: [string, string][] = [
    [copy.id, displayId],
    [copy.contact, contactName],
    [copy.executive, executiveName],
    [
      copy.dateTime,
      new Date(scheduledAt).toLocaleString(dateLocale, {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/Santo_Domingo",
      }),
    ],
    [copy.channel, channel === "meet" ? copy.channelMeet : copy.channelWhatsapp],
    [copy.issued, new Date().toLocaleString(dateLocale)],
  ];

  for (const [label, value] of rows) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(label.toUpperCase(), marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    const lines = doc.splitTextToSize(value, contentWidth);
    doc.text(lines, marginX, y + 16);
    y += 16 + lines.length * 15 + 10;
  }

  y += 10;
  doc.setDrawColor(225, 225, 225);
  doc.setLineWidth(0.75);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const noteLines = doc.splitTextToSize(copy.footerNote, contentWidth);
  doc.text(noteLines, marginX, y);

  // Signature block, anchored to the bottom of the page.
  const sigY = pageHeight - 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(copy.signaturesTitle.toUpperCase(), marginX, sigY - 20);

  const colWidth = contentWidth / 3;
  PARTNERS.forEach((partner, index) => {
    const colX = marginX + index * colWidth;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.75);
    doc.line(colX, sigY, colX + colWidth - 20, sigY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(partner.name, colX, sigY + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(partner.title, colX, sigY + 30);
  });

  doc.save(`cita-${displayId}.pdf`);
}
