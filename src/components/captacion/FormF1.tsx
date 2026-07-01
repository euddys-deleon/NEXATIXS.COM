"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { f1Schema, type F1Values } from "@/lib/validations/prospect";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LegalCheckbox } from "./LegalCheckbox";

export function FormF1({
  onBack,
  onSubmit,
  submitting,
}: {
  onBack: () => void;
  onSubmit: (values: F1Values) => void;
  submitting: boolean;
}) {
  const t = useTranslations("Captacion");
  const tf = useTranslations("Captacion.f1");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<F1Values>({ resolver: zodResolver(f1Schema) });

  const errorText = (message?: string) => (message ? t(`errors.${message}`) : undefined);
  const sectorOptions = tf.raw("sectorOptions") as string[];
  const employeeOptions = tf.raw("employeeOptions") as Record<string, string>;
  const timelineOptions = tf.raw("timelineOptions") as Record<string, string>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        ← {t("back")}
      </button>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {tf("title")}
        </h2>
        <p className="mt-2 text-foreground/60">{tf("subtitle")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={tf("razonSocial")} htmlFor="razonSocial" error={errorText(errors.razonSocial?.message)}>
          <Input id="razonSocial" invalid={!!errors.razonSocial} {...register("razonSocial")} />
        </Field>
        <Field label={tf("rnc")} htmlFor="rnc" error={errorText(errors.rnc?.message)}>
          <Input id="rnc" invalid={!!errors.rnc} {...register("rnc")} />
        </Field>
        <Field label={tf("sector")} htmlFor="sector" error={errorText(errors.sector?.message)}>
          <Select id="sector" defaultValue="" invalid={!!errors.sector} {...register("sector")}>
            <option value="" disabled>
              {tf("sectorPlaceholder")}
            </option>
            {sectorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={tf("employeeCount")}
          htmlFor="employeeCount"
          error={errorText(errors.employeeCount?.message)}
        >
          <Select id="employeeCount" defaultValue="" invalid={!!errors.employeeCount} {...register("employeeCount")}>
            <option value="" disabled>
              —
            </option>
            {Object.entries(employeeOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tf("contactName")} htmlFor="contactName" error={errorText(errors.contactName?.message)}>
          <Input id="contactName" invalid={!!errors.contactName} {...register("contactName")} />
        </Field>
        <Field label={tf("contactRole")} htmlFor="contactRole" error={errorText(errors.contactRole?.message)}>
          <Input id="contactRole" invalid={!!errors.contactRole} {...register("contactRole")} />
        </Field>
        <Field label={tf("email")} htmlFor="email" error={errorText(errors.email?.message)}>
          <Input id="email" type="email" invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label={tf("phone")} htmlFor="phone" error={errorText(errors.phone?.message)}>
          <Input id="phone" invalid={!!errors.phone} {...register("phone")} />
        </Field>
      </div>

      <Field label={tf("currentInfra")} htmlFor="currentInfra" error={errorText(errors.currentInfra?.message)}>
        <Textarea id="currentInfra" invalid={!!errors.currentInfra} {...register("currentInfra")} />
      </Field>
      <Field label={tf("mainObjective")} htmlFor="mainObjective" error={errorText(errors.mainObjective?.message)}>
        <Textarea id="mainObjective" invalid={!!errors.mainObjective} {...register("mainObjective")} />
      </Field>
      <Field label={tf("timeline")} htmlFor="timeline" error={errorText(errors.timeline?.message)}>
        <Select id="timeline" defaultValue="" invalid={!!errors.timeline} {...register("timeline")}>
          <option value="" disabled>
            —
          </option>
          {Object.entries(timelineOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <LegalCheckbox registerProps={register("acceptLegal")} invalid={!!errors.acceptLegal} />

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
