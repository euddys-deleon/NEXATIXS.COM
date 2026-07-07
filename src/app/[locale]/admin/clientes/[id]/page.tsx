import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardTitle } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { AddProjectForm } from "@/components/admin/AddProjectForm";
import { AddProjectPhaseForm } from "@/components/admin/AddProjectPhaseForm";
import { AddLicenseForm } from "@/components/admin/AddLicenseForm";
import { TicketStatusSelect } from "@/components/admin/TicketStatusSelect";
import { UpsellStatusSelect } from "@/components/admin/UpsellStatusSelect";
import { AddInvoiceForm } from "@/components/admin/AddInvoiceForm";
import { InvoiceStatusSelect } from "@/components/admin/InvoiceStatusSelect";

export default async function AdminClienteDetallePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Admin.clients.detail");
  const tProjectStatus = await getTranslations("Estatus.projectStatus");
  const tLicenseStatus = await getTranslations("Estatus.licenseStatus");
  const tTicketPriority = await getTranslations("Portal.tickets.priorityLabels");
  const dateLocale = locale === "en" ? "en-US" : "es-DO";

  const { data: client } = await supabase
    .from("clients")
    .select("id, company_name")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const [
    { data: clientUsers },
    { data: projects },
    { data: licenses },
    { data: tickets },
    { data: upsellRequests },
    { data: invoices },
  ] = await Promise.all([
    supabase.from("client_users").select("id, full_name, role").eq("client_id", client.id),
    supabase
      .from("projects")
      .select("id, name, status, progress_percent")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("licenses")
      .select("id, name, category, status, expires_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tickets")
      .select("id, subject, priority, status, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("upsell_requests")
      .select("id, item_name, status, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, description, amount, currency, status, due_date")
      .eq("client_id", client.id)
      .order("issue_date", { ascending: false }),
  ]);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Link
          href="/admin/clientes"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          ← {t("backToAll")}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {client.company_name}
        </h1>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("usersTitle")}</CardTitle>
          <ul className="mt-3 space-y-1 text-sm text-foreground/70">
            {(clientUsers ?? []).map((cu) => (
              <li key={cu.id}>
                {cu.full_name} — {cu.role}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("projectsTitle")}</CardTitle>
          <ul className="mt-4 space-y-4">
            {(projects ?? []).map((project) => (
              <li key={project.id} className="rounded-lg border border-foreground/10 p-3">
                <p className="text-sm font-medium text-foreground">
                  {project.name} —{" "}
                  <span className="text-foreground/60">
                    {tProjectStatus(project.status)} ({project.progress_percent}%)
                  </span>
                </p>
                <AddProjectPhaseForm projectId={project.id} />
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-foreground/10 pt-4">
            <AddProjectForm clientId={client.id} />
          </div>
        </Card>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("licensesTitle")}</CardTitle>
          <ul className="mt-4 space-y-2 text-sm text-foreground/70">
            {(licenses ?? []).map((license) => (
              <li key={license.id} className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2">
                <span>
                  {license.name} {license.category && `— ${license.category}`}
                </span>
                <span className="text-xs font-medium text-brand-blue">
                  {tLicenseStatus(license.status)}
                  {license.expires_at &&
                    ` · ${new Date(license.expires_at).toLocaleDateString(dateLocale)}`}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-foreground/10 pt-4">
            <AddLicenseForm clientId={client.id} />
          </div>
        </Card>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("invoicesTitle")}</CardTitle>
          <ul className="mt-4 space-y-2">
            {(invoices ?? []).map((invoice) => (
              <li
                key={invoice.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-3 py-2 text-sm"
              >
                <span className="text-foreground">
                  {invoice.invoice_number} —{" "}
                  <span className="text-foreground/60">
                    {invoice.currency} {invoice.amount.toLocaleString(dateLocale, { minimumFractionDigits: 2 })}
                  </span>{" "}
                  <span className="text-foreground/50">({invoice.description})</span>
                </span>
                <InvoiceStatusSelect invoiceId={invoice.id} initialStatus={invoice.status} />
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-foreground/10 pt-4">
            <AddInvoiceForm clientId={client.id} />
          </div>
        </Card>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("ticketsTitle")}</CardTitle>
          <ul className="mt-4 space-y-2">
            {(tickets ?? []).map((ticket) => (
              <li
                key={ticket.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-3 py-2 text-sm"
              >
                <span className="text-foreground">
                  {ticket.subject}{" "}
                  <span className="text-foreground/50">
                    ({tTicketPriority(ticket.priority)})
                  </span>
                </span>
                <TicketStatusSelect ticketId={ticket.id} initialStatus={ticket.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("upsellTitle")}</CardTitle>
          <ul className="mt-4 space-y-2">
            {(upsellRequests ?? []).map((request) => (
              <li
                key={request.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-3 py-2 text-sm"
              >
                <span className="text-foreground">{request.item_name}</span>
                <UpsellStatusSelect requestId={request.id} initialStatus={request.status} />
              </li>
            ))}
          </ul>
        </Card>
      </Container>
    </Section>
  );
}
