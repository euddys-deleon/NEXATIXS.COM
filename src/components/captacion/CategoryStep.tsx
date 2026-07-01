"use client";

import { useTranslations } from "next-intl";
import { OptionCard } from "./OptionCard";
import { StepShell } from "./StepShell";

export type CategoryChoice = "empresa" | "organizacion" | "persona_fisica";

export function CategoryStep({ onSelect }: { onSelect: (choice: CategoryChoice) => void }) {
  const t = useTranslations("Captacion.categoryStep");

  return (
    <StepShell title={t("title")} subtitle={t("subtitle")}>
      <OptionCard
        title={t("empresa.title")}
        description={t("empresa.description")}
        onClick={() => onSelect("empresa")}
      />
      <OptionCard
        title={t("organizacion.title")}
        description={t("organizacion.description")}
        onClick={() => onSelect("organizacion")}
      />
      <OptionCard
        title={t("personaFisica.title")}
        description={t("personaFisica.description")}
        onClick={() => onSelect("persona_fisica")}
      />
    </StepShell>
  );
}
