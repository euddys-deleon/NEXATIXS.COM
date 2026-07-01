import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { TicketReplyForm } from "@/components/portal/TicketReplyForm";
import { AttachmentsPanel } from "@/components/portal/AttachmentsPanel";
import { getAttachmentsWithUrls } from "@/lib/supabase/get-attachments";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  abierto: "bg-blue-500/10 text-blue-600",
  en_progreso: "bg-amber-500/10 text-amber-600",
  resuelto: "bg-emerald-500/10 text-emerald-600",
};

export default async function PortalTicketDetallePage({
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

  const t = await getTranslations("Portal.tickets");
  const tStatus = await getTranslations("Portal.tickets.status");
  const tPriority = await getTranslations("Portal.tickets.priorityLabels");
  const tDetail = await getTranslations("Portal.tickets.detail");
  const dateLocale = locale === "en" ? "en-US" : "es-DO";

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, subject, category, priority, status, description, created_at")
    .eq("id", id)
    .eq("client_id", clientUser.client_id)
    .single();

  if (!ticket) notFound();

  const { data: messages } = await supabase
    .from("ticket_messages")
    .select("id, message, author_id, created_at")
    .eq("ticket_id", ticket.id)
    .order("created_at", { ascending: true });

  const allMessages = messages ?? [];
  const attachments = await getAttachmentsWithUrls(supabase, "ticket", ticket.id);

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link
          href="/portal/tickets"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          ← {tDetail("backToAll")}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {ticket.subject}
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              {ticket.category} · {tPriority(ticket.priority)} ·{" "}
              {new Date(ticket.created_at).toLocaleDateString(dateLocale)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
              statusStyles[ticket.status],
            )}
          >
            {tStatus(ticket.status)}
          </span>
        </div>

        <Card className="mt-6 bg-background">
          <p className="text-sm text-foreground/70">{ticket.description}</p>
        </Card>

        <Card className="mt-6 bg-background">
          <AttachmentsPanel
            entityType="ticket"
            entityId={ticket.id}
            items={attachments}
            canDelete={false}
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
              {allMessages.map((message) => {
                const isMine = message.author_id === user.id;
                return (
                  <li
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-xl px-4 py-3 text-sm",
                      isMine
                        ? "ml-auto bg-brand-blue text-white"
                        : "bg-foreground/5 text-foreground",
                    )}
                  >
                    <p>{message.message}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        isMine ? "text-white/70" : "text-foreground/60",
                      )}
                    >
                      {new Date(message.created_at).toLocaleString(dateLocale)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          <TicketReplyForm ticketId={ticket.id} authorId={user.id} />
        </Card>
      </Container>
    </Section>
  );
}
