"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";

const STATUS_OPTIONS = ["pendiente", "aprobada", "rechazada"];

export function UpsellStatusSelect({
  requestId,
  initialStatus,
}: {
  requestId: string;
  initialStatus: string;
}) {
  const t = useTranslations("Portal.upsell.statusLabels");
  const router = useRouter();

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    await supabase.from("upsell_requests").update({ status: event.target.value }).eq("id", requestId);
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
