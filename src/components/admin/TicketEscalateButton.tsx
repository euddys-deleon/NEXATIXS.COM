"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function TicketEscalateButton({
  ticketId,
  initialEscalated,
}: {
  ticketId: string;
  initialEscalated: boolean;
}) {
  const t = useTranslations("Admin.tickets");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    await supabase
      .from("tickets")
      .update({
        escalated: !initialEscalated,
        escalated_at: !initialEscalated ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={initialEscalated ? "primary" : "outline"}
      size="sm"
      disabled={submitting}
      onClick={handleClick}
      className={initialEscalated ? "!bg-red-600 hover:!bg-red-700" : ""}
    >
      <AlertTriangle size={14} />
      {initialEscalated ? t("escalated") : t("escalate")}
    </Button>
  );
}
