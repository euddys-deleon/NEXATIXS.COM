"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function StaffTicketReplyForm({
  ticketId,
  staffAuthorId,
}: {
  ticketId: string;
  staffAuthorId: string;
}) {
  const t = useTranslations("Admin.tickets.detail");
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      staff_author_id: staffAuthorId,
      message: message.trim(),
      is_internal: isInternal,
    });
    setMessage("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={isInternal ? t("internalPlaceholder") : t("replyPlaceholder")}
        rows={3}
      />
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(event) => setIsInternal(event.target.checked)}
            className="h-4 w-4 rounded border-foreground/30"
          />
          {t("internalToggle")}
        </label>
        <Button type="submit" disabled={submitting} size="sm">
          {isInternal ? t("addNote") : t("send")}
        </Button>
      </div>
    </form>
  );
}
