"use client";

import { useTranslations } from "next-intl";
import { OptionCard } from "./OptionCard";
import { StepShell } from "./StepShell";

export type OrgPath = "analisis_profundo" | "consulta_rapida";

export function OrgPathStep({
  onSelect,
  onBack,
}: {
  onSelect: (path: OrgPath) => void;
  onBack: () => void;
}) {
  const t = useTranslations("Captacion.orgPathStep");

  return (
    <StepShell title={t("title")} subtitle={t("subtitle")} onBack={onBack}>
      <OptionCard
        title={t("analisisProfundo.title")}
        description={t("analisisProfundo.description")}
        onClick={() => onSelect("analisis_profundo")}
      />
      <OptionCard
        title={t("consultaRapida.title")}
        description={t("consultaRapida.description")}
        onClick={() => onSelect("consulta_rapida")}
      />
    </StepShell>
  );
}
