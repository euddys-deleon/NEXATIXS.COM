import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { NewTicketToggle } from "@/components/portal/NewTicketToggle";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  abierto: "bg-blue-500/10 text-blue-600",
  en_progreso: "bg-amber-500/10 text-amber-600",
  resuelto: "bg-emerald-500/10 text-emerald-600",
};

export default async function PortalTicketsPage({
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

  const t = await getTranslations("Portal.tickets");
  const tStatus = await getTranslations("Portal.tickets.status");
  const tPriority = await getTranslations("Portal.tickets.priorityLabels");

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, subject, category, priority, status, created_at")
    .eq("client_id", clientUser.client_id)
    .order("created_at", { ascending: false });

  const allTickets = tickets ?? [];

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-foreground/60">{t("subtitle")}</p>
          </div>
        </div>

        <div className="mt-6">
          <NewTicketToggle clientId={clientUser.client_id} createdBy={user.id} />
        </div>

        <Card className="mt-8 bg-background !p-0">
          {allTickets.length === 0 ? (
            <p className="p-6 text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            <ul>
              {allTickets.map((ticket) => (
                <li key={ticket.id} className="border-b border-foreground/5 last:border-0">
                  <Link
                    href={`/portal/tickets/${ticket.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-foreground/5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                      <p className="mt-0.5 text-xs text-foreground/60">
                        {ticket.category} · {tPriority(ticket.priority)} ·{" "}
                        {new Date(ticket.created_at).toLocaleDateString(
                          locale === "en" ? "en-US" : "es-DO",
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                        statusStyles[ticket.status],
                      )}
                    >
                      {tStatus(ticket.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Container>
    </Section>
  );
}
