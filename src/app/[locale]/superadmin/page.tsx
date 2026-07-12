import { redirect, Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  DollarSign,
  FileClock,
  FolderKanban,
  LayoutGrid,
  LifeBuoy,
  ScrollText,
  Target,
  UserPlus,
  Users,
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
  ]);

  const allInvoices = invoices ?? [];
  const revenue = allInvoices
    .filter((invoice) => invoice.status === "pagada")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingInvoices = allInvoices.filter((invoice) => invoice.status === "pendiente");
  const overdueInvoices = allInvoices.filter((invoice) => invoice.status === "vencida").length;
  const currency = allInvoices[0]?.currency ?? "USD";

  const sections = [
    { href: "/admin/clientes", icon: Users, key: "clients" },
    { href: "/admin/prospectos", icon: Target, key: "prospects" },
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
            icon={DollarSign}
            label={t("kpi.revenue")}
            value={`${currency} ${revenue.toLocaleString(numberLocale, { minimumFractionDigits: 2 })}`}
          />
          <KpiCard
            index={1}
            icon={Building2}
            label={t("kpi.activeClients")}
            value={String(activeClients ?? 0)}
          />
          <KpiCard
            index={2}
            icon={UserPlus}
            label={t("kpi.newClients")}
            value={String(newClients ?? 0)}
          />
          <KpiCard
            index={3}
            icon={Target}
            label={t("kpi.activeProspects")}
            value={String(activeProspects ?? 0)}
          />
          <KpiCard
            index={4}
            icon={FolderKanban}
            label={t("kpi.activeProjects")}
            value={String(activeProjects ?? 0)}
          />
          <KpiCard
            index={5}
            icon={LifeBuoy}
            label={t("kpi.openTickets")}
            value={String(openTickets ?? 0)}
          />
          <KpiCard
            index={6}
            icon={FileClock}
            label={t("kpi.pendingInvoices")}
            value={String(pendingInvoices.length)}
            hint={`${currency} ${pendingInvoices
              .reduce((sum, invoice) => sum + invoice.amount, 0)
              .toLocaleString(numberLocale, { minimumFractionDigits: 2 })}`}
          />
          <KpiCard
            index={7}
            icon={AlertTriangle}
            label={t("kpi.overdueInvoices")}
            value={String(overdueInvoices)}
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
