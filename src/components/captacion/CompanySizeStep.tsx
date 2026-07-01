"use client";

import { useTranslations } from "next-intl";
import { OptionCard } from "./OptionCard";
import { StepShell } from "./StepShell";

export type CompanySize = "grande" | "mediana" | "pequena";

export function CompanySizeStep({
  onSelect,
  onBack,
}: {
  onSelect: (size: CompanySize) => void;
  onBack: () => void;
}) {
  const t = useTranslations("Captacion.companySizeStep");

  return (
    <StepShell title={t("title")} subtitle={t("subtitle")} onBack={onBack}>
      <OptionCard title={t("grande.title")} description={t("grande.description")} onClick={() => onSelect("grande")} />
      <OptionCard title={t("mediana.title")} description={t("mediana.description")} onClick={() => onSelect("mediana")} />
      <OptionCard title={t("pequena.title")} description={t("pequena.description")} onClick={() => onSelect("pequena")} />
    </StepShell>
  );
}
