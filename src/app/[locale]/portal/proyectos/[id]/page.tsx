import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { PipelineTimeline } from "@/components/estatus/PipelineTimeline";

export default async function PortalProyectoDetallePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { user, clientUser, supabase } = await getPortalContext();

  if (!user || !clientUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Portal.projects");
  const tStatus = await getTranslations("Estatus.projectStatus");
  const tPipeline = await getTranslations("Estatus.pipeline");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, progress_percent, start_date, estimated_end_date")
    .eq("id", id)
    .eq("client_id", clientUser.client_id)
    .single();

  if (!project) notFound();

  const { data: history } = await supabase
    .from("project_status_history")
    .select("phase, notes, changed_at")
    .eq("project_id", project.id)
    .order("changed_at", { ascending: true });

  const allHistory = history ?? [];
  const currentPhase = allHistory.at(-1)?.phase;
  const dateLocale = locale === "en" ? "en-US" : "es-DO";

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link
          href="/portal/proyectos"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          ← {t("backToAll")}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {project.name}
        </h1>

        <div className="mt-4 flex flex-wrap gap-6 text-sm text-foreground/60">
          <span>
            <strong className="text-foreground">{tStatus(project.status)}</strong> —{" "}
            {project.progress_percent}%
          </span>
          {project.start_date && (
            <span>
              {t("startDate")}:{" "}
              {new Date(project.start_date).toLocaleDateString(dateLocale)}
            </span>
          )}
          {project.estimated_end_date && (
            <span>
              {t("estimatedEnd")}:{" "}
              {new Date(project.estimated_end_date).toLocaleDateString(dateLocale)}
            </span>
          )}
        </div>

        <Card className="mt-8 bg-background">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/50">
            {t("timelineTitle")}
          </h2>

          {currentPhase ? (
            <div className="mt-6">
              <PipelineTimeline currentPhase={currentPhase} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-foreground/50">{t("noHistory")}</p>
          )}

          {allHistory.length > 0 && (
            <ul className="mt-8 space-y-4 border-t border-foreground/10 pt-6">
              {allHistory
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li key={`${entry.phase}-${index}`} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{tPipeline(entry.phase)}</span>
                      <span className="text-xs text-foreground/50">
                        {new Date(entry.changed_at).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                    {entry.notes && <p className="mt-1 text-foreground/60">{entry.notes}</p>}
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </Container>
    </Section>
  );
}
