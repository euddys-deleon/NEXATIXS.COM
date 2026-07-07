"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ClientProfileFormProps {
  clientId: string;
  companySize: string | null;
  initial: {
    rnc: string | null;
    sector: string | null;
    employeeCount: number | null;
    country: string | null;
    city: string | null;
    website: string | null;
    domain: string | null;
    supportLevel: string | null;
  };
}

export function ClientProfileForm({ clientId, companySize, initial }: ClientProfileFormProps) {
  const t = useTranslations("Admin.clients.detail");
  const tSize = useTranslations("Admin.clients.companySize");
  const router = useRouter();
  const [values, setValues] = useState({
    rnc: initial.rnc ?? "",
    sector: initial.sector ?? "",
    employeeCount: initial.employeeCount != null ? String(initial.employeeCount) : "",
    country: initial.country ?? "",
    city: initial.city ?? "",
    website: initial.website ?? "",
    domain: initial.domain ?? "",
    supportLevel: initial.supportLevel ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    await supabase
      .from("clients")
      .update({
        rnc: values.rnc || null,
        sector: values.sector || null,
        employee_count: values.employeeCount ? Number(values.employeeCount) : null,
        country: values.country || null,
        city: values.city || null,
        website: values.website || null,
        domain: values.domain || null,
        support_level: values.supportLevel || null,
      })
      .eq("id", clientId);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label={t("rnc")} htmlFor="rnc">
        <Input id="rnc" value={values.rnc} onChange={(e) => update("rnc", e.target.value)} />
      </Field>
      <Field label={t("sector")} htmlFor="sector">
        <Input id="sector" value={values.sector} onChange={(e) => update("sector", e.target.value)} />
      </Field>
      <Field label={t("employeeCount")} htmlFor="employeeCount">
        <Input
          id="employeeCount"
          type="number"
          min="0"
          value={values.employeeCount}
          onChange={(e) => update("employeeCount", e.target.value)}
        />
      </Field>
      <Field label={t("country")} htmlFor="country">
        <Input id="country" value={values.country} onChange={(e) => update("country", e.target.value)} />
      </Field>
      <Field label={t("city")} htmlFor="city">
        <Input id="city" value={values.city} onChange={(e) => update("city", e.target.value)} />
      </Field>
      <Field label={t("website")} htmlFor="website">
        <Input id="website" value={values.website} onChange={(e) => update("website", e.target.value)} />
      </Field>
      <Field label={t("domain")} htmlFor="domain">
        <Input id="domain" value={values.domain} onChange={(e) => update("domain", e.target.value)} />
      </Field>
      <Field label={t("supportLevel")} htmlFor="supportLevel">
        <Input
          id="supportLevel"
          value={values.supportLevel}
          onChange={(e) => update("supportLevel", e.target.value)}
        />
      </Field>
      <Field label={t("companySize")} htmlFor="companySizeReadonly">
        <p id="companySizeReadonly" className="flex h-11 items-center text-sm text-foreground/60">
          {companySize ? tSize(companySize) : t("companySizeEmpty")}
        </p>
      </Field>

      <div className="sm:col-span-2 lg:col-span-3">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
