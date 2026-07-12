"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const BILLING_OPTIONS = ["mensual", "anual", "unico"];

type Plan = {
  id: string;
  category: string;
  name: string;
  price: number | null;
  annual_price: number | null;
  currency: string;
  billing_period: string;
  description: string | null;
  features: unknown;
  is_featured: boolean;
  display_order: number;
  active: boolean;
};

export function PlanRow({ plan }: { plan: Plan }) {
  const t = useTranslations("Admin.plans");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(plan.price != null ? String(plan.price) : "");
  const [annualPrice, setAnnualPrice] = useState(
    plan.annual_price != null ? String(plan.annual_price) : "",
  );
  const [currency, setCurrency] = useState(plan.currency);
  const [billingPeriod, setBillingPeriod] = useState(plan.billing_period);
  const [description, setDescription] = useState(plan.description ?? "");
  const [features, setFeatures] = useState(
    Array.isArray(plan.features) ? (plan.features as string[]).join("\n") : "",
  );
  const [displayOrder, setDisplayOrder] = useState(String(plan.display_order));

  async function toggleActive(value: boolean) {
    await supabase.from("plans").update({ active: value }).eq("id", plan.id);
    router.refresh();
  }

  async function toggleFeatured(value: boolean) {
    await supabase.from("plans").update({ is_featured: value }).eq("id", plan.id);
    router.refresh();
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await supabase
      .from("plans")
      .update({
        name: name.trim(),
        price: price.trim() ? Number(price) : null,
        annual_price: annualPrice.trim() ? Number(annualPrice) : null,
        currency: currency.trim() || "USD",
        billing_period: billingPeriod,
        description: description.trim() || null,
        features: features
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        display_order: Number(displayOrder) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(t("confirmDelete"))) return;
    await supabase.from("plans").delete().eq("id", plan.id);
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-brand-blue/30 bg-background p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t("name")} htmlFor={`name-${plan.id}`}>
            <Input id={`name-${plan.id}`} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t("price")} htmlFor={`price-${plan.id}`}>
            <Input
              id={`price-${plan.id}`}
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t("priceHelp")}
            />
          </Field>
          <Field label={t("annualPrice")} htmlFor={`annual-${plan.id}`}>
            <Input
              id={`annual-${plan.id}`}
              type="number"
              min="0"
              step="0.01"
              value={annualPrice}
              onChange={(e) => setAnnualPrice(e.target.value)}
              placeholder={t("annualPriceHelp")}
            />
          </Field>
          <Field label={t("currency")} htmlFor={`currency-${plan.id}`}>
            <Input
              id={`currency-${plan.id}`}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </Field>
          <Field label={t("billingPeriod")} htmlFor={`billing-${plan.id}`}>
            <Select
              id={`billing-${plan.id}`}
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value)}
            >
              {BILLING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`billingLabels.${option}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("displayOrder")} htmlFor={`order-${plan.id}`}>
            <Input
              id={`order-${plan.id}`}
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </Field>
        </div>
        <Field label={t("description")} htmlFor={`desc-${plan.id}`}>
          <Textarea
            id={`desc-${plan.id}`}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label={t("features")} htmlFor={`features-${plan.id}`}>
          <Textarea
            id={`features-${plan.id}`}
            rows={4}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
        </Field>
        <div className="flex gap-3">
          <Button type="submit" size="sm" disabled={saving}>
            {t("save")}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
            {t("cancel")}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background p-4",
        !plan.active && "opacity-50",
      )}
    >
      <div className="min-w-[180px] flex-1">
        <p className="font-medium text-foreground">{plan.name}</p>
        <p className="text-sm text-foreground/60">
          {plan.price != null
            ? `${plan.currency} ${plan.price.toLocaleString()} · ${t(`billingLabels.${plan.billing_period}`)}`
            : t("priceHelp")}
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground/70">
        <Checkbox
          checked={plan.is_featured}
          onChange={(e) => toggleFeatured(e.target.checked)}
        />
        {t("featured")}
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground/70">
        <Checkbox checked={plan.active} onChange={(e) => toggleActive(e.target.checked)} />
        {t("active")}
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
