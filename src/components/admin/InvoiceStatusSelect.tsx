"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";

const STATUS_OPTIONS = ["pendiente", "pagada", "vencida", "cancelada"];

export function InvoiceStatusSelect({
  invoiceId,
  initialStatus,
}: {
  invoiceId: string;
  initialStatus: string;
}) {
  const t = useTranslations("Portal.invoices.statusLabels");
  const router = useRouter();

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const status = event.target.value;
    await supabase
      .from("invoices")
      .update({
        status,
        paid_date: status === "pagada" ? new Date().toISOString().slice(0, 10) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);
    router.refresh();
  }

  return (
    <Select defaultValue={initialStatus} onChange={handleChange} className="h-9 w-auto text-xs">
      {STATUS_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {t(option)}
        </option>
      ))}
    </Select>
  );
}
