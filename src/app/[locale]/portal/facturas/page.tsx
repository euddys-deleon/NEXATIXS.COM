import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { InvoiceDownloadButton } from "@/components/portal/InvoiceDownloadButton";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-500/10 text-amber-600",
  pagada: "bg-emerald-500/10 text-emerald-600",
  vencida: "bg-red-500/10 text-red-600",
  cancelada: "bg-foreground/10 text-foreground/50",
};

export default async function PortalFacturasPage({
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

  const t = await getTranslations("Portal.invoices");
  const dateLocale = locale === "en" ? "en-US" : "es-DO";

  const [{ data: invoices }, { data: client }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, description, amount, currency, status, issue_date, due_date")
      .eq("client_id", clientUser.client_id)
      .order("issue_date", { ascending: false }),
    supabase.from("clients").select("company_name").eq("id", clientUser.client_id).single(),
  ]);

  const allInvoices = invoices ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <Card className="mt-8 bg-background !p-0">
          {allInvoices.length === 0 ? (
            <p className="p-6 text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/60">
                  <th className="px-5 py-3 font-medium">{t("columns.number")}</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    {t("columns.description")}
                  </th>
                  <th className="px-5 py-3 font-medium">{t("columns.amount")}</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    {t("columns.dueDate")}
                  </th>
                  <th className="px-5 py-3 font-medium">{t("columns.status")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {allInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-foreground/5 last:border-0">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {invoice.invoice_number}
                    </td>
                    <td className="hidden px-5 py-4 text-foreground/60 sm:table-cell">
                      {invoice.description}
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      {invoice.currency} {invoice.amount.toLocaleString(dateLocale, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="hidden px-5 py-4 text-foreground/60 sm:table-cell">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString(dateLocale)
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          statusStyles[invoice.status],
                        )}
                      >
                        {t(`statusLabels.${invoice.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <InvoiceDownloadButton
                        companyName={client?.company_name ?? clientUser.full_name}
                        invoiceNumber={invoice.invoice_number}
                        description={invoice.description}
                        amount={invoice.amount}
                        currency={invoice.currency}
                        status={invoice.status}
                        issueDate={invoice.issue_date}
                        dueDate={invoice.due_date}
                        label={t("downloadPdf")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </Container>
    </Section>
  );
}
