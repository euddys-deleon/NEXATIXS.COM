"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";

const PRIORITY_OPTIONS = ["baja", "media", "alta", "critica"];

export function TicketPrioritySelect({
  ticketId,
  initialPriority,
}: {
  ticketId: string;
  initialPriority: string;
}) {
  const tPriority = useTranslations("Portal.tickets.priorityLabels");
  const router = useRouter();

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    await supabase
      .from("tickets")
      .update({ priority: event.target.value, updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    router.refresh();
  }

  return (
    <Select defaultValue={initialPriority} onChange={handleChange} className="h-9 w-auto text-xs">
      {PRIORITY_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {tPriority(option)}
        </option>
      ))}
    </Select>
  );
}
