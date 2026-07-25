import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  abierto: "bg-blue-500/10 text-blue-600",
  en_revision: "bg-violet-500/10 text-violet-600",
  asignado: "bg-cyan-500/10 text-cyan-600",
  en_progreso: "bg-amber-500/10 text-amber-600",
  pendiente_cliente: "bg-orange-500/10 text-orange-600",
  resuelto: "bg-emerald-500/10 text-emerald-600",
  cerrado: "bg-foreground/10 text-foreground/60",
};

const priorityStyles: Record<string, string> = {
  baja: "text-foreground/60",
  media: "text-foreground",
  alta: "text-amber-600",
  critica: "text-red-600",
};

const STATUS_OPTIONS = [
  "abierto",
  "en_revision",
  "asignado",
  "en_progreso",
  "pendiente_cliente",
  "resuelto",
  "cerrado",
];
const PRIORITY_OPTIONS = ["baja", "media", "alta", "critica"];

export default async function AdminTicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const { locale } = await params;
  const { status = "", priority = "" } = await searchParams;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Admin.tickets");
  const tStatus = await getTranslations("Portal.tickets.status");
  const tPriority = await getTranslations("Portal.tickets.priorityLabels");

  let query = supabase
    .from("tickets")
    .select(
      "id, subject, priority, status, sla_due_at, escalated, created_at, clients(company_name), assigned:staff_users!tickets_assigned_to_fkey(full_name)",
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  const { data: tickets } = await query;
  const allTickets = tickets ?? [];
  const now = Date.now();

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
          <Select name="status" defaultValue={status} className="w-auto min-w-[180px]">
            <option value="">{t("allStatuses")}</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {tStatus(option)}
              </option>
            ))}
          </Select>
          <Select name="priority" defaultValue={priority} className="w-auto min-w-[160px]">
            <option value="">{t("allPriorities")}</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {tPriority(option)}
              </option>
            ))}
          </Select>
          <Button type="submit" size="md">
            {t("filter")}
          </Button>
        </form>

        <Card className="mt-6 bg-background !p-0">
          {allTickets.length === 0 ? (
            <p className="p-6 text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/50">
                  <th className="px-5 py-3 font-medium">{t("columns.subject")}</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    {t("columns.client")}
                  </th>
                  <th className="px-5 py-3 font-medium">{t("columns.priority")}</th>
                  <th className="px-5 py-3 font-medium">{t("columns.status")}</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">
                    {t("columns.assigned")}
                  </th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">
                    {t("columns.sla")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {allTickets.map((ticket) => {
                  const slaBreached =
                    ticket.sla_due_at &&
                    new Date(ticket.sla_due_at).getTime() < now &&
                    ticket.status !== "resuelto" &&
                    ticket.status !== "cerrado";

                  return (
                    <tr key={ticket.id} className="border-b border-foreground/5 last:border-0">
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="flex items-center gap-2 font-medium text-brand-blue hover:underline"
                        >
                          {ticket.escalated && (
                            <AlertTriangle size={14} className="shrink-0 text-red-600" />
                          )}
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="hidden px-5 py-4 text-foreground/70 sm:table-cell">
                        {ticket.clients?.company_name ?? "—"}
                      </td>
                      <td className={cn("px-5 py-4 font-medium", priorityStyles[ticket.priority])}>
                        {tPriority(ticket.priority)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            statusStyles[ticket.status],
                          )}
                        >
                          {tStatus(ticket.status)}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-foreground/70 md:table-cell">
                        {ticket.assigned?.full_name ?? t("unassigned")}
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        {ticket.sla_due_at && (
                          <span className={slaBreached ? "font-medium text-red-600" : "text-foreground/60"}>
                            {new Date(ticket.sla_due_at).toLocaleString(
                              locale === "en" ? "en-US" : "es-DO",
                              { dateStyle: "short", timeStyle: "short" },
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </Container>
    </Section>
  );
}
