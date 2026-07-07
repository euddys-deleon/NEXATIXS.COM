"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function AddInvoiceForm({ clientId }: { clientId: string }) {
  const t = useTranslations("Admin.clients.detail");
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const amountValue = Number(amount);
    if (!description.trim() || !amountValue) return;
    setSubmitting(true);
    await supabase.from("invoices").insert({
      client_id: clientId,
      description: description.trim(),
      amount: amountValue,
      due_date: dueDate || null,
      invoice_number: "",
    });
    setSubmitting(false);
    setDescription("");
    setAmount("");
    setDueDate("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Field label={t("invoiceDescription")} htmlFor="invoiceDescription" className="min-w-[200px] flex-1">
        <Textarea
          id="invoiceDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={1}
        />
      </Field>
      <Field label={t("invoiceAmount")} htmlFor="invoiceAmount">
        <Input
          id="invoiceAmount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Field>
      <Field label={t("invoiceDueDate")} htmlFor="invoiceDueDate">
        <Input
          id="invoiceDueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </Field>
      <Button type="submit" size="sm" disabled={submitting}>
        {t("add")}
      </Button>
    </form>
  );
}
