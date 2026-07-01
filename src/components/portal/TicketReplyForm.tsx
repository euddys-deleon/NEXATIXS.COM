"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function TicketReplyForm({ ticketId, authorId }: { ticketId: string; authorId: string }) {
  const t = useTranslations("Portal.tickets.detail");
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    await supabase
      .from("ticket_messages")
      .insert({ ticket_id: ticketId, author_id: authorId, message: message.trim() });
    setMessage("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={t("replyPlaceholder")}
        rows={2}
        className="flex-1"
      />
      <Button type="submit" disabled={submitting} className="sm:self-end">
        {t("send")}
      </Button>
    </form>
  );
}
