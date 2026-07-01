"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const PHASES = [
  "contacto_inicial",
  "entrevista_virtual",
  "auditoria_levantamiento",
  "propuesta_cotizacion",
  "firma_contrato",
  "desarrollo_implementacion",
] as const;

export function PipelineTimeline({ currentPhase }: { currentPhase: string }) {
  const t = useTranslations("Estatus.pipeline");
  const currentIndex = PHASES.indexOf(currentPhase as (typeof PHASES)[number]);

  return (
    <ol className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
      {PHASES.map((phase, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={phase} className="flex flex-col items-center gap-2 text-center">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold",
                done && "border-brand-blue bg-brand-blue text-white",
                active && "border-brand-blue text-brand-blue",
                !done && !active && "border-foreground/20 text-foreground/60",
              )}
            >
              {done ? <Check size={16} /> : index + 1}
            </span>
            <span
              className={cn(
                "text-xs leading-tight",
                active ? "font-semibold text-foreground" : "text-foreground/60",
              )}
            >
              {t(phase)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
