"use client";

import { useLocale } from "next-intl";
import { Download } from "lucide-react";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";

interface InvoiceDownloadButtonProps {
  companyName: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  label: string;
}

export function InvoiceDownloadButton({
  companyName,
  invoiceNumber,
  description,
  amount,
  currency,
  status,
  issueDate,
  dueDate,
  label,
}: InvoiceDownloadButtonProps) {
  const locale = useLocale();

  function handleDownload() {
    generateInvoicePdf({
      companyName,
      invoiceNumber,
      description,
      amount,
      currency,
      status,
      issueDate,
      dueDate,
      locale,
    });
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue hover:underline"
    >
      <Download size={13} />
      {label}
    </button>
  );
}
