"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function SupportForm() {
  const t = useTranslations("Support.form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayId, setDisplayId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("create_support_ticket", {
      p_contact_name: name,
      p_contact_email: email,
      // Nullable en la base de datos; el tipo generado lo marca `string`, de ahi el cast.
      p_contact_phone: (phone || null) as unknown as string,
      p_subject: subject,
      p_message: message,
    });

    setSubmitting(false);

    if (rpcError || !data) {
      setError(t("errorGeneric"));
      return;
    }

    setDisplayId(data as string);
  }

  if (displayId) {
    return (
      <Card className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
          <CheckCircle2 size={24} />
        </span>
        <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
          {t("successTitle")}
        </h3>
        <p className="mt-2 text-sm text-foreground/70">{t("successText")}</p>
        <p className="mt-3 font-heading text-xl font-bold text-brand-blue">{displayId}</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-heading text-lg font-semibold text-foreground">{t("title")}</h3>
      <p className="mt-1 text-sm text-foreground/60">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("nameLabel")} htmlFor="support-name">
            <Input
              id="support-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label={t("emailLabel")} htmlFor="support-email">
            <Input
              id="support-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
        </div>
        <Field label={t("phoneLabel")} htmlFor="support-phone">
          <Input
            id="support-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </Field>
        <Field label={t("subjectLabel")} htmlFor="support-subject">
          <Input
            id="support-subject"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </Field>
        <Field label={t("messageLabel")} htmlFor="support-message">
          <Textarea
            id="support-message"
            required
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          <Send size={16} />
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Card>
  );
}
