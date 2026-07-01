"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { f3Schema, type F3Values } from "@/lib/validations/prospect";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LegalCheckbox } from "./LegalCheckbox";

export function FormF3({
  onBack,
  onSubmit,
  submitting,
}: {
  onBack: () => void;
  onSubmit: (values: F3Values) => void;
  submitting: boolean;
}) {
  const t = useTranslations("Captacion");
  const tf = useTranslations("Captacion.f3");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<F3Values>({ resolver: zodResolver(f3Schema) });

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
        <Field label={tf("fullName")} htmlFor="fullName" error={errorText(errors.fullName?.message)}>
          <Input id="fullName" invalid={!!errors.fullName} {...register("fullName")} />
        </Field>
        <Field label={tf("cedula")} htmlFor="cedula" error={errorText(errors.cedula?.message)}>
          <Input id="cedula" invalid={!!errors.cedula} {...register("cedula")} />
        </Field>
        <Field label={tf("email")} htmlFor="email" error={errorText(errors.email?.message)}>
          <Input id="email" type="email" invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label={tf("phone")} htmlFor="phone" error={errorText(errors.phone?.message)}>
          <Input id="phone" invalid={!!errors.phone} {...register("phone")} />
        </Field>
        <Field label={tf("occupation")} htmlFor="occupation" error={errorText(errors.occupation?.message)}>
          <Input id="occupation" invalid={!!errors.occupation} {...register("occupation")} />
        </Field>
        <Field label={tf("reason")} htmlFor="reason" error={errorText(errors.reason?.message)}>
          <Input id="reason" invalid={!!errors.reason} {...register("reason")} />
        </Field>
      </div>

      <LegalCheckbox registerProps={register("acceptLegal")} invalid={!!errors.acceptLegal} />

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
