"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ConvertToClientForm({
  prospectId,
  defaultEmail,
  defaultName,
}: {
  prospectId: string;
  defaultEmail: string;
  defaultName: string;
}) {
  const t = useTranslations("Admin.prospects.detail");
  const router = useRouter();
  const [authEmail, setAuthEmail] = useState(defaultEmail);
  const [companyName, setCompanyName] = useState("");
  const [contactFullName, setContactFullName] = useState(defaultName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("admin_activate_client", {
      p_prospect_id: prospectId,
      p_auth_email: authEmail,
      p_company_name: companyName,
      p_contact_full_name: contactFullName,
    });

    setSubmitting(false);

    if (rpcError) {
      if (rpcError.message.includes("auth_user_not_found")) setError(t("convertErrorNotFound"));
      else if (rpcError.message.includes("auth_user_already_linked"))
        setError(t("convertErrorAlreadyLinked"));
      else setError(t("convertErrorGeneric"));
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return <p className="text-sm text-emerald-600">{t("convertSuccess")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-foreground/60">{t("convertHelp")}</p>
      <Field label={t("authEmail")} htmlFor="authEmail">
        <Input
          id="authEmail"
          type="email"
          required
          value={authEmail}
          onChange={(event) => setAuthEmail(event.target.value)}
        />
      </Field>
      <Field label={t("companyName")} htmlFor="companyName">
        <Input
          id="companyName"
          required
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
        />
      </Field>
      <Field label={t("contactFullName")} htmlFor="contactFullName">
        <Input
          id="contactFullName"
          required
          value={contactFullName}
          onChange={(event) => setContactFullName(event.target.value)}
        />
      </Field>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {t("convertSubmit")}
      </Button>
    </form>
  );
}
