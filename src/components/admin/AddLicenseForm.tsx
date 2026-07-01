"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = ["activa", "por_vencer", "expirada"];

export function AddLicenseForm({ clientId }: { clientId: string }) {
  const t = useTranslations("Admin.clients.detail");
  const tStatus = useTranslations("Estatus.licenseStatus");
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("activa");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await supabase.from("licenses").insert({
      client_id: clientId,
      name: name.trim(),
      category: category.trim() || null,
      status,
      expires_at: expiresAt || null,
    });
    setSubmitting(false);
    setName("");
    setCategory("");
    setExpiresAt("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Field label={t("licenseName")} htmlFor="licenseName" className="min-w-[180px] flex-1">
        <Input id="licenseName" value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label={t("licenseCategory")} htmlFor="licenseCategory">
        <Input
          id="licenseCategory"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </Field>
      <Field label={t("licenseStatus")} htmlFor="licenseStatus">
        <Select id="licenseStatus" value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {tStatus(option)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("licenseExpiry")} htmlFor="licenseExpiry">
        <Input
          id="licenseExpiry"
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
        />
      </Field>
      <Button type="submit" size="sm" disabled={submitting}>
        {t("add")}
      </Button>
    </form>
  );
}
