import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Activity, ExternalLink, FolderKanban, KeyRound, LifeBuoy } from "lucide-react";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { getCategoryIcon } from "@/lib/portal-icons";
import { daysUntil } from "@/lib/date-utils";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardTitle } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { KpiCard } from "@/components/portal/KpiCard";
import { UsageBar } from "@/components/portal/UsageBar";
import { ProjectListItem } from "@/components/portal/ProjectListItem";
import { AnalyticsReports } from "@/components/portal/AnalyticsReports";

export default async function PortalDashboardPage({
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

  const t = await getTranslations("Portal.dashboard");

  const [{ data: projects }, { data: licenses }, { data: tickets }, { data: client }, { data: clientTools }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name, status, progress_percent, start_date, created_at")
        .eq("client_id", clientUser.client_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("licenses")
        .select("id, name, category, status, usage_percent")
        .eq("client_id", clientUser.client_id),
      supabase
        .from("tickets")
        .select("id, subject, priority, status")
        .eq("client_id", clientUser.client_id),
      supabase
        .from("clients")
        .select("company_name, prospect_id")
        .eq("id", clientUser.client_id)
        .single(),
      supabase
        .from("client_tools")
        .select("id, status, tool:tools(name, url, version)")
        .eq("client_id", clientUser.client_id)
        .eq("status", "activa"),
    ]);

  let displayId = "—";
  if (client?.prospect_id) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("display_id")
      .eq("id", client.prospect_id)
      .single();
    if (prospect) displayId = prospect.display_id;
  }

  const allProjects = projects ?? [];
  const allLicenses = licenses ?? [];
  const allTickets = tickets ?? [];

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);
  const newProjectsThisMonth = allProjects.filter(
    (project) => new Date(project.created_at) >= firstOfMonth,
  ).length;

  const licensesExpiringSoon = allLicenses.filter((license) => license.status === "por_vencer").length;
  const openTickets = allTickets.filter((ticket) =>
    ["abierto", "en_progreso"].includes(ticket.status),
  ).length;

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("greeting")}, {clientUser.full_name.split(" ")[0]}
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            index={0}
            icon={<FolderKanban size={18} />}
            label={t("kpi.activeProjects")}
            value={String(allProjects.length)}
            hint={newProjectsThisMonth > 0 ? `+${newProjectsThisMonth} este mes` : undefined}
          />
          <KpiCard
            index={1}
            icon={<KeyRound size={18} />}
            label={t("kpi.activeLicenses")}
            value={String(allLicenses.length)}
            hint={
              licensesExpiringSoon > 0
                ? t("kpiHints.licensesExpiring", { count: licensesExpiringSoon })
                : undefined
            }
          />
          <KpiCard
            index={2}
            icon={<LifeBuoy size={18} />}
            label={t("kpi.openTickets")}
            value={String(openTickets)}
            hint={t("kpiHints.ticketsSla")}
          />
          <KpiCard
            index={3}
            icon={<Activity size={18} />}
            label={t("kpi.uptime")}
            value="99.9%"
            hint={t("kpiHints.uptimeWindow")}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="bg-background">
            <CardTitle>{t("usageTitle")}</CardTitle>
            <div className="mt-5 space-y-5">
              {allLicenses.length === 0 && (
                <p className="text-sm text-foreground/60">{t("noLicenses")}</p>
              )}
              {allLicenses.map((license) => {
                const CategoryIcon = getCategoryIcon(license.category);
                return (
                  <UsageBar
                    key={license.id}
                    icon={<CategoryIcon size={16} className="text-brand-blue" />}
                    name={license.name}
                    category={license.category}
                    percent={license.usage_percent ?? 0}
                  />
                );
              })}
            </div>
          </Card>

          <Card className="bg-background">
            <CardTitle>{t("recentProjectsTitle")}</CardTitle>
            <ul className="mt-5 space-y-3">
              {allProjects.length === 0 && (
                <p className="text-sm text-foreground/60">{t("noProjects")}</p>
              )}
              {allProjects.map((project) => (
                <ProjectListItem
                  key={project.id}
                  name={project.name}
                  status={project.status}
                  progressPercent={project.progress_percent}
                  daysUntilStart={daysUntil(project.start_date)}
                />
              ))}
            </ul>
          </Card>
        </div>

        <div className="mt-10">
          <Card className="bg-background">
            <CardTitle>{t("toolsTitle")}</CardTitle>
            {!clientTools || clientTools.length === 0 ? (
              <p className="mt-3 text-sm text-foreground/60">{t("noTools")}</p>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {clientTools.map((clientTool) => (
                  <li
                    key={clientTool.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{clientTool.tool?.name}</p>
                      {clientTool.tool?.version && (
                        <p className="text-xs text-foreground/50">v{clientTool.tool.version}</p>
                      )}
                    </div>
                    {clientTool.tool?.url && (
                      <a
                        href={clientTool.tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        {t("openTool")} <ExternalLink size={14} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/portal/tickets" className={buttonVariants({ variant: "primary" })}>
            {t("quickActions.reportIssue")}
          </Link>
          <Link href="/portal/servicios" className={buttonVariants({ variant: "outline" })}>
            {t("quickActions.upsell")}
          </Link>
        </div>

        <div className="mt-10">
          <AnalyticsReports
            companyName={client?.company_name ?? clientUser.full_name}
            displayId={displayId}
            projects={allProjects}
            licenses={allLicenses}
            tickets={allTickets}
          />
        </div>
      </Container>
    </Section>
  );
}
