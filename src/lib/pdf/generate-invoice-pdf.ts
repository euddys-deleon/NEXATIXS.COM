import { jsPDF } from "jspdf";

interface InvoiceInput {
  companyName: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  locale: string;
}

const COPY = {
  es: {
    heading: "Factura",
    account: "Cliente",
    number: "Número",
    issueDate: "Fecha de emisión",
    dueDate: "Fecha de vencimiento",
    status: "Estado",
    description: "Descripción",
    amount: "Monto",
    statusLabels: { pendiente: "Pendiente", pagada: "Pagada", vencida: "Vencida", cancelada: "Cancelada" },
  },
  en: {
    heading: "Invoice",
    account: "Client",
    number: "Number",
    issueDate: "Issue date",
    dueDate: "Due date",
    status: "Status",
    description: "Description",
    amount: "Amount",
    statusLabels: { pendiente: "Pending", pagada: "Paid", vencida: "Overdue", cancelada: "Cancelled" },
  },
};

export function generateInvoicePdf({
  companyName,
  invoiceNumber,
  description,
  amount,
  currency,
  status,
  issueDate,
  dueDate,
  locale,
}: InvoiceInput) {
  const copy = locale === "en" ? COPY.en : COPY.es;
  const dateLocale = locale === "en" ? "en-US" : "es-DO";
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("NEXATIXS", marginX, y);
  y += 24;
  doc.setFontSize(14);
  doc.text(`${copy.heading} ${invoiceNumber}`, marginX, y);

  y += 32;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${copy.account}: ${companyName}`, marginX, y);
  y += 16;
  doc.text(`${copy.number}: ${invoiceNumber}`, marginX, y);
  y += 16;
  doc.text(`${copy.issueDate}: ${new Date(issueDate).toLocaleDateString(dateLocale)}`, marginX, y);
  y += 16;
  if (dueDate) {
    doc.text(`${copy.dueDate}: ${new Date(dueDate).toLocaleDateString(dateLocale)}`, marginX, y);
    y += 16;
  }
  doc.text(
    `${copy.status}: ${copy.statusLabels[status as keyof typeof copy.statusLabels] ?? status}`,
    marginX,
    y,
  );

  y += 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(copy.description, marginX, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(description, marginX, y, { maxWidth: 500 });

  y += 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    `${copy.amount}: ${currency} ${amount.toLocaleString(dateLocale, { minimumFractionDigits: 2 })}`,
    marginX,
    y,
  );

  doc.save(`${invoiceNumber}.pdf`);
}
