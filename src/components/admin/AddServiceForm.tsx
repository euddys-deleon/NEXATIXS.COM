"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { servicePillars } from "@/lib/services-catalog";

export function AddServiceForm() {
  const t = useTranslations("Admin.services");
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [pillarSlug, setPillarSlug] = useState(servicePillars[0].slug);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!itemName.trim()) return;
    setSubmitting(true);
    await supabase.from("services_catalog").insert({
      item_name: itemName.trim(),
      pillar_slug: pillarSlug,
    });
    setSubmitting(false);
    setItemName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Field label={t("name")} htmlFor="serviceName" className="min-w-[220px] flex-1">
        <Input id="serviceName" value={itemName} onChange={(event) => setItemName(event.target.value)} />
      </Field>
      <Field label={t("pillar")} htmlFor="servicePillar">
        <Select id="servicePillar" value={pillarSlug} onChange={(event) => setPillarSlug(event.target.value)}>
          {servicePillars.map((pillar) => (
            <option key={pillar.slug} value={pillar.slug}>
              {t(`pillars.${pillar.slug}`)}
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
