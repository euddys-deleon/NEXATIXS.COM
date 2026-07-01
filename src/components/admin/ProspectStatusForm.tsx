"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = ["prospecto", "en_evaluacion", "cliente_activo", "descartado"];
const PHASE_OPTIONS = [
  "contacto_inicial",
  "entrevista_virtual",
  "auditoria_levantamiento",
  "propuesta_cotizacion",
  "firma_contrato",
  "desarrollo_implementacion",
];

export function ProspectStatusForm({
  prospectId,
  initialStatus,
  initialPhase,
}: {
  prospectId: string;
  initialStatus: string;
  initialPhase: string;
}) {
  const t = useTranslations("Admin.prospects.detail");
  const tPipeline = useTranslations("Estatus.pipeline");
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [phase, setPhase] = useState(initialPhase);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await supabase
      .from("prospects")
      .update({ status, pipeline_phase: phase })
      .eq("id", prospectId);
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={t("statusLabel")} htmlFor="status">
        <Select id="status" value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("phaseLabel")} htmlFor="phase">
        <Select id="phase" value={phase} onChange={(event) => setPhase(event.target.value)}>
          {PHASE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {tPipeline(option)}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
        {saved && <span className="text-sm text-emerald-600">{t("saved")}</span>}
      </div>
    </div>
  );
}
