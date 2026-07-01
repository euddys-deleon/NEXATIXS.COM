import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";

export default async function AdminClientesPage({
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

  const t = await getTranslations("Admin.clients");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name, created_at")
    .order("created_at", { ascending: false });

  const allClients = clients ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <Card className="mt-8 bg-background !p-0">
          {allClients.length === 0 ? (
            <p className="p-6 text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            <ul>
              {allClients.map((client) => (
                <li key={client.id} className="border-b border-foreground/5 last:border-0">
                  <Link
                    href={`/admin/clientes/${client.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-foreground/5"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {client.company_name}
                    </span>
                    <span className="text-xs text-brand-blue">{t("viewDetail")} →</span>
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
