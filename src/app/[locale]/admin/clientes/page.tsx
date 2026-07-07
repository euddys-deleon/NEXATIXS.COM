import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export default async function AdminClientesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; size?: string }>;
}) {
  const { locale } = await params;
  const { q = "", size = "" } = await searchParams;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Admin.clients");
  const tSize = await getTranslations("Admin.clients.companySize");

  let query = supabase
    .from("clients")
    .select("id, company_name, created_at, company_size, sector")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("company_name", `%${q}%`);
  if (size) query = query.eq("company_size", size);

  const { data: clients } = await query;
  const allClients = clients ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
          <Input
            name="q"
            defaultValue={q}
            placeholder={t("searchPlaceholder")}
            className="min-w-[220px] flex-1"
          />
          <Select name="size" defaultValue={size} className="w-auto min-w-[180px]">
            <option value="">{t("allSizes")}</option>
            <option value="microempresa">{tSize("microempresa")}</option>
            <option value="pequena_empresa">{tSize("pequena_empresa")}</option>
            <option value="mediana_empresa">{tSize("mediana_empresa")}</option>
            <option value="gran_empresa">{tSize("gran_empresa")}</option>
          </Select>
          <Button type="submit" size="md">
            {t("search")}
          </Button>
        </form>

        <Card className="mt-6 bg-background !p-0">
          {allClients.length === 0 ? (
            <p className="p-6 text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            <ul>
              {allClients.map((client) => (
                <li key={client.id} className="border-b border-foreground/5 last:border-0">
                  <Link
                    href={`/admin/clientes/${client.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-foreground/5"
                  >
                    <span>
                      <span className="text-sm font-medium text-foreground">
                        {client.company_name}
                      </span>
                      {client.sector && (
                        <span className="ml-2 text-xs text-foreground/50">{client.sector}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-3">
                      {client.company_size && (
                        <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-foreground/60">
                          {tSize(client.company_size)}
                        </span>
                      )}
                      <span className="text-xs text-brand-blue">{t("viewDetail")} →</span>
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
