"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { servicePillars } from "@/lib/services-catalog";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  pillar_slug: string;
  item_name: string;
  is_upsell_eligible: boolean;
};

export function ServiceRow({ service }: { service: Service }) {
  const t = useTranslations("Admin.services");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemName, setItemName] = useState(service.item_name);
  const [pillarSlug, setPillarSlug] = useState(service.pillar_slug);

  async function toggleUpsell(value: boolean) {
    await supabase.from("services_catalog").update({ is_upsell_eligible: value }).eq("id", service.id);
    router.refresh();
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!itemName.trim()) return;
    setSaving(true);
    await supabase
      .from("services_catalog")
      .update({ item_name: itemName.trim(), pillar_slug: pillarSlug })
      .eq("id", service.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(t("confirmDelete"))) return;
    await supabase.from("services_catalog").delete().eq("id", service.id);
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-brand-blue/30 bg-background p-4"
      >
        <Field label={t("name")} htmlFor={`name-${service.id}`} className="min-w-[180px] flex-1">
          <Input
            id={`name-${service.id}`}
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
          />
        </Field>
        <Field label={t("pillar")} htmlFor={`pillar-${service.id}`}>
          <Select
            id={`pillar-${service.id}`}
            value={pillarSlug}
            onChange={(event) => setPillarSlug(event.target.value)}
          >
            {servicePillars.map((pillar) => (
              <option key={pillar.slug} value={pillar.slug}>
                {t(`pillars.${pillar.slug}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" size="sm" disabled={saving}>
          {t("save")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
          {t("cancel")}
        </Button>
      </form>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background p-4",
        !service.is_upsell_eligible && "opacity-60",
      )}
    >
      <p className="min-w-[180px] flex-1 font-medium text-foreground">{service.item_name}</p>
      <label className="flex items-center gap-2 text-sm text-foreground/70">
        <Checkbox checked={service.is_upsell_eligible} onChange={(event) => toggleUpsell(event.target.checked)} />
        {t("upsellEligible")}
      </label>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
          {t("edit")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleDelete}>
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
