import { redirect, Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileClock,
  FolderKanban,
  KeyRound,
  LayoutGrid,
  LifeBuoy,
  Loader,
  ScrollText,
  ShieldAlert,
  Siren,
  Target,
  UserCog,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/portal/KpiCard";

export default async function SuperadminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Superadmin");
  const numberLocale = locale === "en" ? "en-US" : "es-DO";

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: activeClients },
    { count: newClients },
    { count: activeProjects },
    { count: openTickets },
    { count: activeProspects },
    { data: invoices },
    { data: portalTickets },
    { data: supportTickets },
    { data: licenses },
    { count: staffUserCount },
    { count: clientUserCount },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", firstOfMonth.toISOString()),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .neq("status", "completado"),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .in("status", ["abierto", "en_progreso"]),
    supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .in("status", ["prospecto", "en_evaluacion"]),
    supabase.from("invoices").select("amount, currency, status"),
    supabase.from("tickets").select("status, priority"),
    supabase.from("support_tickets").select("status"),
    supabase.from("licenses").select("status"),
    supabase.from("staff_users").select("*", { count: "exact", head: true }),
    supabase.from("client_users").select("*", { count: "exact", head: true }),
  ]);

  const allInvoices = invoices ?? [];
  const revenue = allInvoices
    .filter((invoice) => invoice.status === "pagada")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingInvoices = allInvoices.filter((invoice) => invoice.status === "pendiente");
  const overdueInvoices = allInvoices.filter((invoice) => invoice.status === "vencida").length;
  const currency = allInvoices[0]?.currency ?? "USD";

  // Estado operativo: solo se muestra lo que hoy tiene una fuente de datos real
  // (tickets, licencias, cuentas de usuario). El PDF de mejoras también pide
  // métricas de IA (conversaciones/precisión) y monitoreo de plataforma
  // (uptime, errores 500) — no existe todavía ninguna tabla ni integración que
  // las respalde, así que no se inventan números aquí; quedan pendientes de
  // una fase aparte que primero construya esa instrumentación.
  const allTickets = [...(portalTickets ?? []), ...(supportTickets ?? [])];
  const ticketsInProgress = allTickets.filter((t) => t.status === "en_progreso").length;
  const ticketsResolved = allTickets.filter(
    (t) => t.status === "resuelto" || t.status === "cerrado",
  ).length;
  const ticketsCritical = (portalTickets ?? []).filter((t) => t.priority === "critica").length;

  const allLicenses = licenses ?? [];
  const licensesActive = allLicenses.filter((l) => l.status === "activa").length;
  const licensesExpiringSoon = allLicenses.filter((l) => l.status === "por_vencer").length;
  const licensesExpired = allLicenses.filter((l) => l.status === "expirada").length;

  const sections = [
    { href: "/admin/clientes", icon: Users, key: "clients" },
    { href: "/admin/prospectos", icon: Target, key: "prospects" },
    { href: "/admin/tickets", icon: LifeBuoy, key: "tickets" },
    { href: "/admin/servicios", icon: Wrench, key: "services" },
    { href: "/admin/planes", icon: LayoutGrid, key: "plans" },
    { href: "/admin/auditoria", icon: ScrollText, key: "audit" },
  ] as const;

  return (
    <Section>
      <Container>
        <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
          {t("eyebrow")}
        </span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title", { name: staffUser.full_name })}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            index={0}
            icon={<DollarSign size={18} />}
            label={t("kpi.revenue")}
            value={`${currency} ${revenue.toLocaleString(numberLocale, { minimumFractionDigits: 2 })}`}
          />
          <KpiCard
            index={1}
            icon={<Building2 size={18} />}
            label={t("kpi.activeClients")}
            value={String(activeClients ?? 0)}
          />
          <KpiCard
            index={2}
            icon={<UserPlus size={18} />}
            label={t("kpi.newClients")}
            value={String(newClients ?? 0)}
          />
          <KpiCard
            index={3}
            icon={<Target size={18} />}
            label={t("kpi.activeProspects")}
            value={String(activeProspects ?? 0)}
          />
          <KpiCard
            index={4}
            icon={<FolderKanban size={18} />}
            label={t("kpi.activeProjects")}
            value={String(activeProjects ?? 0)}
          />
          <KpiCard
            index={5}
            icon={<LifeBuoy size={18} />}
            label={t("kpi.openTickets")}
            value={String(openTickets ?? 0)}
          />
          <KpiCard
            index={6}
            icon={<FileClock size={18} />}
            label={t("kpi.pendingInvoices")}
            value={String(pendingInvoices.length)}
            hint={`${currency} ${pendingInvoices
              .reduce((sum, invoice) => sum + invoice.amount, 0)
              .toLocaleString(numberLocale, { minimumFractionDigits: 2 })}`}
          />
          <KpiCard
            index={7}
            icon={<AlertTriangle size={18} />}
            label={t("kpi.overdueInvoices")}
            value={String(overdueInvoices)}
          />
        </div>

        <h2 className="mt-12 font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
          {t("operationalTitle")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard index={0} icon={<Loader size={18} />} label={t("kpi.ticketsInProgress")} value={String(ticketsInProgress)} />
          <KpiCard
            index={1}
            icon={<CheckCircle2 size={18} />}
            label={t("kpi.ticketsResolved")}
            value={String(ticketsResolved)}
          />
          <KpiCard index={2} icon={<Siren size={18} />} label={t("kpi.ticketsCritical")} value={String(ticketsCritical)} />
          <KpiCard
            index={3}
            icon={<ShieldAlert size={18} />}
            label={t("kpi.licensesExpiringSoon")}
            value={String(licensesExpiringSoon)}
            hint={t("kpi.licensesExpiringSoonHint", { active: licensesActive, expired: licensesExpired })}
          />
          <KpiCard index={4} icon={<KeyRound size={18} />} label={t("kpi.licensesActive")} value={String(licensesActive)} />
          <KpiCard
            index={5}
            icon={<UserCog size={18} />}
            label={t("kpi.staffUsers")}
            value={String(staffUserCount ?? 0)}
          />
          <KpiCard
            index={6}
            icon={<Users size={18} />}
            label={t("kpi.clientUsers")}
            value={String(clientUserCount ?? 0)}
          />
        </div>

        <h2 className="mt-12 font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
          {t("manageTitle")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:border-brand-blue/50">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <section.icon size={20} strokeWidth={1.75} />
                </span>
                <p className="mt-4 font-heading font-semibold text-foreground">
                  {t(`sections.${section.key}.title`)}
                </p>
                <p className="mt-1 text-sm text-foreground/60">
                  {t(`sections.${section.key}.description`)}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm text-foreground/50">
          <ClipboardList size={16} className="text-brand-blue" />
          {t("footnote")}
        </div>
      </Container>
    </Section>
  );
}
