import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  AlertTriangle,
  Building2,
  DollarSign,
  FileClock,
  FolderKanban,
  LifeBuoy,
  Target,
  UserPlus,
} from "lucide-react";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { KpiCard } from "@/components/portal/KpiCard";

export default async function AdminDashboardPage({
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

  const t = await getTranslations("Admin.dashboard");

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
    supabase.from("projects").select("*", { count: "exact", head: true }).neq("status", "completado"),
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

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            index={0}
            icon={DollarSign}
            label={t("kpi.revenue")}
            value={`${currency} ${revenue.toLocaleString(locale === "en" ? "en-US" : "es-DO", { minimumFractionDigits: 2 })}`}
          />
          <KpiCard index={1} icon={Building2} label={t("kpi.activeClients")} value={String(activeClients ?? 0)} />
          <KpiCard index={2} icon={UserPlus} label={t("kpi.newClients")} value={String(newClients ?? 0)} />
          <KpiCard index={3} icon={Target} label={t("kpi.activeProspects")} value={String(activeProspects ?? 0)} />
          <KpiCard index={4} icon={FolderKanban} label={t("kpi.activeProjects")} value={String(activeProjects ?? 0)} />
          <KpiCard index={5} icon={LifeBuoy} label={t("kpi.openTickets")} value={String(openTickets ?? 0)} />
          <KpiCard
            index={6}
            icon={FileClock}
            label={t("kpi.pendingInvoices")}
            value={String(pendingInvoices.length)}
            hint={`${currency} ${pendingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0).toLocaleString(locale === "en" ? "en-US" : "es-DO", { minimumFractionDigits: 2 })}`}
          />
          <KpiCard
            index={7}
            icon={AlertTriangle}
            label={t("kpi.overdueInvoices")}
            value={String(overdueInvoices)}
          />
        </div>
      </Container>
    </Section>
  );
}
