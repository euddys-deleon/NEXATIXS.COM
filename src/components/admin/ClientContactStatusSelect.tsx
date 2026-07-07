"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";

const STATUS_OPTIONS = ["activo", "inactivo"];

export function ClientContactStatusSelect({
  contactId,
  initialStatus,
}: {
  contactId: string;
  initialStatus: string;
}) {
  const t = useTranslations("Admin.clients.detail.contactStatusLabels");
  const router = useRouter();

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    await supabase.from("client_contacts").update({ status: event.target.value }).eq("id", contactId);
    router.refresh();
  }

  return (
    <Select defaultValue={initialStatus} onChange={handleChange} className="h-8 w-auto text-xs">
      {STATUS_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {t(option)}
        </option>
      ))}
    </Select>
  );
}
