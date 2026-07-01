"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = ["en_desarrollo", "completado", "en_cola", "en_soporte"];

export function AddProjectForm({ clientId }: { clientId: string }) {
  const t = useTranslations("Admin.clients.detail");
  const tStatus = useTranslations("Estatus.projectStatus");
  const router = useRouter();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("en_desarrollo");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await supabase.from("projects").insert({ client_id: clientId, name: name.trim(), status });
    setSubmitting(false);
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Field label={t("projectName")} htmlFor="projectName" className="min-w-[200px] flex-1">
        <Input id="projectName" value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label={t("projectStatus")} htmlFor="projectStatus">
        <Select id="projectStatus" value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {tStatus(option)}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" size="sm" disabled={submitting}>
        {t("add")}
      </Button>
    </form>
  );
}
