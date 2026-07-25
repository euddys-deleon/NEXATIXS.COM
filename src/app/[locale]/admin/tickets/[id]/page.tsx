import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { TicketStatusSelect } from "@/components/admin/TicketStatusSelect";
import { TicketPrioritySelect } from "@/components/admin/TicketPrioritySelect";
import { TicketAssignSelect } from "@/components/admin/TicketAssignSelect";
import { TicketEscalateButton } from "@/components/admin/TicketEscalateButton";
import { StaffTicketReplyForm } from "@/components/admin/StaffTicketReplyForm";
import { AttachmentsPanel } from "@/components/portal/AttachmentsPanel";
import { getAttachmentsWithUrls } from "@/lib/supabase/get-attachments";
import { cn } from "@/lib/utils";

export default async function AdminTicketDetallePage({
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

  const t = await getTranslations("Admin.tickets");
  const tStatus = await getTranslations("Portal.tickets.status");
  const tPriority = await getTranslations("Portal.tickets.priorityLabels");
  const dateLocale = locale === "en" ? "en-US" : "es-DO";

  const { data: ticket } = await supabase
    .from("tickets")
    .select(
      "id, subject, category, priority, status, description, assigned_to, sla_due_at, escalated, created_at, clients(company_name)",
    )
    .eq("id", id)
    .single();

  if (!ticket) notFound();

  const [{ data: messages }, { data: staffOptions }] = await Promise.all([
    supabase
      .from("ticket_messages")
      .select("id, message, author_id, staff_author_id, is_internal, created_at")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true }),
    supabase.from("staff_users").select("id, full_name").order("full_name"),
  ]);

  const allMessages = messages ?? [];
  const attachments = await getAttachmentsWithUrls(supabase, "ticket", ticket.id);
  const slaBreached =
    ticket.sla_due_at &&
    new Date(ticket.sla_due_at).getTime() < Date.now() &&
    ticket.status !== "resuelto" &&
    ticket.status !== "cerrado";

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link href="/admin/tickets" className="text-sm font-medium text-brand-blue hover:underline">
          ← {t("backToAll")}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {ticket.subject}
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              {ticket.clients?.company_name ?? "—"} · {ticket.category} ·{" "}
              {new Date(ticket.created_at).toLocaleDateString(dateLocale)}
            </p>
          </div>
          <TicketEscalateButton ticketId={ticket.id} initialEscalated={ticket.escalated} />
        </div>

        <Card className="mt-6 bg-background">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                {t("columns.status")}
              </p>
              <div className="mt-1.5">
                <TicketStatusSelect ticketId={ticket.id} initialStatus={ticket.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                {t("columns.priority")}
              </p>
              <div className="mt-1.5">
                <TicketPrioritySelect ticketId={ticket.id} initialPriority={ticket.priority} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                {t("columns.assigned")}
              </p>
              <div className="mt-1.5">
                <TicketAssignSelect
                  ticketId={ticket.id}
                  initialAssignedTo={ticket.assigned_to}
                  staffOptions={staffOptions ?? []}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                {t("columns.sla")}
              </p>
              <p className={cn("mt-2 text-sm", slaBreached ? "font-medium text-red-600" : "text-foreground")}>
                {ticket.sla_due_at
                  ? new Date(ticket.sla_due_at).toLocaleString(dateLocale, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—"}
                {slaBreached && ` · ${t("slaBreached")}`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mt-6 bg-background">
          <p className="text-sm text-foreground/70">{ticket.description}</p>
        </Card>

        <Card className="mt-6 bg-background">
          <AttachmentsPanel
            entityType="ticket"
            entityId={ticket.id}
            items={attachments}
            canDelete
          />
        </Card>

        <Card className="mt-6 bg-background">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
            {t("detail.messagesTitle")}
          </h2>

          {allMessages.length === 0 ? (
            <p className="mt-4 text-sm text-foreground/60">{t("detail.noMessages")}</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {allMessages.map((message) => (
                <li
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-xl px-4 py-3 text-sm",
                    message.is_internal
                      ? "border border-dashed border-amber-400/60 bg-amber-500/10 text-foreground"
                      : message.staff_author_id
                        ? "bg-brand-blue text-white"
                        : "ml-auto bg-foreground/5 text-foreground",
                  )}
                >
                  {message.is_internal && (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                      {t("detail.internalLabel")}
                    </p>
                  )}
                  <p>{message.message}</p>
                  <p
                    className={cn(
                      "mt-1 text-[11px]",
                      !message.is_internal && message.staff_author_id
                        ? "text-white/70"
                        : "text-foreground/60",
                    )}
                  >
                    {new Date(message.created_at).toLocaleString(dateLocale)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <StaffTicketReplyForm ticketId={ticket.id} staffAuthorId={user.id} />
        </Card>
      </Container>
    </Section>
  );
}
