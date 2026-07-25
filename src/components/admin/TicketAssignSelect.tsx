"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";

export function TicketAssignSelect({
  ticketId,
  initialAssignedTo,
  staffOptions,
}: {
  ticketId: string;
  initialAssignedTo: string | null;
  staffOptions: { id: string; full_name: string }[];
}) {
  const t = useTranslations("Admin.tickets");
  const router = useRouter();

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value || null;
    await supabase
      .from("tickets")
      .update({
        assigned_to: value,
        status: value ? "asignado" : "abierto",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
    router.refresh();
  }

  return (
    <Select defaultValue={initialAssignedTo ?? ""} onChange={handleChange} className="h-9 w-auto text-xs">
      <option value="">{t("unassigned")}</option>
      {staffOptions.map((staff) => (
        <option key={staff.id} value={staff.id}>
          {staff.full_name}
        </option>
      ))}
    </Select>
  );
}
