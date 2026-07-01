import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const badgeStyles: Record<string, string> = {
  en_desarrollo: "bg-blue-500/10 text-blue-600",
  en_soporte: "bg-blue-500/10 text-blue-600",
  completado: "bg-emerald-500/10 text-emerald-600",
  en_cola: "bg-foreground/10 text-foreground/60",
};

export function ProjectListItem({
  name,
  status,
  progressPercent,
  daysUntilStart,
}: {
  name: string;
  status: string;
  progressPercent: number;
  daysUntilStart?: number | null;
}) {
  const t = useTranslations("Estatus.projectStatus");
  const tp = useTranslations("Portal.dashboard");
  const label = t(status);

  let subtext = label;
  if (status === "en_desarrollo") {
    subtext = `${label} - ${tp("progressSuffix", { percent: progressPercent })}`;
  } else if (status === "en_soporte") {
    subtext = `${label} - ${tp("supportSuffix")}`;
  } else if (status === "en_cola" && daysUntilStart != null) {
    subtext = `${label} - ${tp("queuedSuffix", { days: daysUntilStart })}`;
  }

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 text-xs text-foreground/60">{subtext}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
          badgeStyles[status] ?? badgeStyles.en_cola,
        )}
      >
        {label}
      </span>
    </li>
  );
}
