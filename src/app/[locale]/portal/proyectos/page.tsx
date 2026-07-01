import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { daysUntil } from "@/lib/date-utils";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { ProjectListItem } from "@/components/portal/ProjectListItem";

export default async function PortalProyectosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user, clientUser, supabase } = await getPortalContext();

  if (!user || !clientUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Portal.projects");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, progress_percent, start_date, created_at")
    .eq("client_id", clientUser.client_id)
    .order("created_at", { ascending: false });

  const allProjects = projects ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <Card className="mt-8 bg-background">
          {allProjects.length === 0 ? (
            <p className="text-sm text-foreground/50">{t("empty")}</p>
          ) : (
            <ul className="space-y-3">
              {allProjects.map((project) => (
                <Link key={project.id} href={`/portal/proyectos/${project.id}`} className="block">
                  <ProjectListItem
                    name={project.name}
                    status={project.status}
                    progressPercent={project.progress_percent}
                    daysUntilStart={daysUntil(project.start_date)}
                  />
                </Link>
              ))}
            </ul>
          )}
        </Card>
      </Container>
    </Section>
  );
}
