"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const PHASE_OPTIONS = [
  "contacto_inicial",
  "entrevista_virtual",
  "auditoria_levantamiento",
  "propuesta_cotizacion",
  "firma_contrato",
  "desarrollo_implementacion",
];

export function AddProjectPhaseForm({ projectId }: { projectId: string }) {
  const t = useTranslations("Admin.clients.detail");
  const tPipeline = useTranslations("Estatus.pipeline");
  const router = useRouter();
  const [phase, setPhase] = useState(PHASE_OPTIONS[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    await supabase
      .from("project_status_history")
      .insert({ project_id: projectId, phase, notes: notes.trim() || null });
    setSubmitting(false);
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2">
      <Select value={phase} onChange={(event) => setPhase(event.target.value)} className="h-9 text-xs">
        {PHASE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {tPipeline(option)}
          </option>
        ))}
      </Select>
      <Input
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder={t("phaseNotes")}
        className="h-9 min-w-[160px] flex-1 text-xs"
      />
      <Button type="submit" size="sm" variant="outline" disabled={submitting}>
        {t("addPhase")}
      </Button>
    </form>
  );
}
