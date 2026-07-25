"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const ticketSchema = z.object({
  category: z.string().min(1, "required"),
  priority: z.enum(["baja", "media", "alta", "critica"]),
  subject: z.string().min(1, "required"),
  description: z.string().min(1, "required"),
});

type TicketValues = z.infer<typeof ticketSchema>;

export function NewTicketForm({
  clientId,
  createdBy,
  onDone,
}: {
  clientId: string;
  createdBy: string;
  onDone: () => void;
}) {
  const t = useTranslations("Portal.tickets.form");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketValues>({ resolver: zodResolver(ticketSchema) });

  const categoryOptions = t.raw("categoryOptions") as string[];

  async function onSubmit(values: TicketValues) {
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("tickets").insert({
      client_id: clientId,
      created_by: createdBy,
      category: values.category,
      priority: values.priority,
      subject: values.subject,
      description: values.description,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("category")} htmlFor="category" error={errors.category ? " " : undefined}>
          <Select id="category" defaultValue="" invalid={!!errors.category} {...register("category")}>
            <option value="" disabled>
              {t("categoryPlaceholder")}
            </option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("priority")} htmlFor="priority">
          <Select id="priority" defaultValue="media" {...register("priority")}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </Select>
        </Field>
      </div>

      <Field label={t("subject")} htmlFor="subject" error={errors.subject ? " " : undefined}>
        <Input id="subject" invalid={!!errors.subject} {...register("subject")} />
      </Field>

      <Field label={t("description")} htmlFor="description" error={errors.description ? " " : undefined}>
        <Textarea id="description" invalid={!!errors.description} {...register("description")} />
      </Field>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
