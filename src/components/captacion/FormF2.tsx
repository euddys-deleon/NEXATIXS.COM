"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { f2Schema, type F2Values } from "@/lib/validations/prospect";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LegalCheckbox } from "./LegalCheckbox";

export function FormF2({
  onBack,
  onSubmit,
  submitting,
}: {
  onBack: () => void;
  onSubmit: (values: F2Values) => void;
  submitting: boolean;
}) {
  const t = useTranslations("Captacion");
  const tf = useTranslations("Captacion.f2");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<F2Values>({ resolver: zodResolver(f2Schema) });

  const errorText = (message?: string) => (message ? t(`errors.${message}`) : undefined);

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
        <Field label={tf("businessName")} htmlFor="businessName" error={errorText(errors.businessName?.message)}>
          <Input id="businessName" invalid={!!errors.businessName} {...register("businessName")} />
        </Field>
        <Field label={tf("requesterName")} htmlFor="requesterName" error={errorText(errors.requesterName?.message)}>
          <Input id="requesterName" invalid={!!errors.requesterName} {...register("requesterName")} />
        </Field>
        <Field label={tf("email")} htmlFor="email" error={errorText(errors.email?.message)}>
          <Input id="email" type="email" invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label={tf("phone")} htmlFor="phone" error={errorText(errors.phone?.message)}>
          <Input id="phone" invalid={!!errors.phone} {...register("phone")} />
        </Field>
        <Field
          label={tf("businessActivity")}
          htmlFor="businessActivity"
          error={errorText(errors.businessActivity?.message)}
          className="sm:col-span-2"
        >
          <Input id="businessActivity" invalid={!!errors.businessActivity} {...register("businessActivity")} />
        </Field>
      </div>

      <Field label={tf("helpArea")} htmlFor="helpArea" error={errorText(errors.helpArea?.message)}>
        <Textarea id="helpArea" invalid={!!errors.helpArea} {...register("helpArea")} />
      </Field>
      <Field label={tf("website")} htmlFor="website" error={errorText(errors.website?.message)}>
        <Input id="website" invalid={!!errors.website} {...register("website")} />
      </Field>

      <LegalCheckbox registerProps={register("acceptLegal")} invalid={!!errors.acceptLegal} />

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
