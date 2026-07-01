"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";

const STATUS_OPTIONS = ["abierto", "en_progreso", "resuelto"];

export function TicketStatusSelect({
  ticketId,
  initialStatus,
}: {
  ticketId: string;
  initialStatus: string;
}) {
  const tStatus = useTranslations("Portal.tickets.status");
  const router = useRouter();

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    await supabase
      .from("tickets")
      .update({ status: event.target.value, updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    router.refresh();
  }

  return (
    <Select defaultValue={initialStatus} onChange={handleChange} className="h-9 w-auto text-xs">
      {STATUS_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {tStatus(option)}
        </option>
      ))}
    </Select>
  );
}
