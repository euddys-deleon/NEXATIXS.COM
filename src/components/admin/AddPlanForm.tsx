"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const CATEGORY_OPTIONS = ["mayfren", "web", "herramientas", "redes_sociales"];
const BILLING_OPTIONS = ["mensual", "anual", "unico"];

export function AddPlanForm() {
  const t = useTranslations("Admin.plans");
  const router = useRouter();
  const [category, setCategory] = useState("mayfren");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [annualPrice, setAnnualPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [billingPeriod, setBillingPeriod] = useState("mensual");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await supabase.from("plans").insert({
      category,
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
    });
    setSubmitting(false);
    setName("");
    setPrice("");
    setAnnualPrice("");
    setDescription("");
    setFeatures("");
    setDisplayOrder("0");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={t("category")} htmlFor="planCategory">
          <Select
            id="planCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`categories.${option}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("name")} htmlFor="planName">
          <Input id="planName" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t("price")} htmlFor="planPrice">
          <Input
            id="planPrice"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t("priceHelp")}
          />
        </Field>
        <Field label={t("annualPrice")} htmlFor="planAnnualPrice">
          <Input
            id="planAnnualPrice"
            type="number"
            min="0"
            step="0.01"
            value={annualPrice}
            onChange={(e) => setAnnualPrice(e.target.value)}
            placeholder={t("annualPriceHelp")}
          />
        </Field>
        <Field label={t("currency")} htmlFor="planCurrency">
          <Input id="planCurrency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </Field>
        <Field label={t("billingPeriod")} htmlFor="planBilling">
          <Select
            id="planBilling"
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
        <Field label={t("displayOrder")} htmlFor="planOrder">
          <Input
            id="planOrder"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </Field>
      </div>
      <Field label={t("description")} htmlFor="planDescription">
        <Textarea
          id="planDescription"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <Field label={t("features")} htmlFor="planFeatures">
        <Textarea
          id="planFeatures"
          rows={4}
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
        />
      </Field>
      <Button type="submit" size="sm" disabled={submitting}>
        {t("add")}
      </Button>
    </form>
  );
}
