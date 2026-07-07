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
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  prospecto: "bg-blue-500/10 text-blue-600",
  en_evaluacion: "bg-amber-500/10 text-amber-600",
  cliente_activo: "bg-emerald-500/10 text-emerald-600",
  descartado: "bg-foreground/10 text-foreground/60",
};

const STATUS_OPTIONS = ["prospecto", "en_evaluacion", "cliente_activo", "descartado"];
const CATEGORY_OPTIONS = ["empresa", "organizacion", "persona_fisica"];

export default async function AdminProspectosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { q = "", status = "", category = "" } = await searchParams;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Admin.prospects");
  const tStatus = await getTranslations("Admin.prospects.statusLabels");
  const tCategory = await getTranslations("Admin.prospects.categoryLabels");

  let query = supabase
    .from("prospects")
    .select("id, display_id, contact_name, category, status, created_at")
    .order("created_at", { ascending: false });

  if (q) query = query.or(`contact_name.ilike.%${q}%,display_id.ilike.%${q}%`);
  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);

  const { data: prospects } = await query;
  const allProspects = prospects ?? [];

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
          <Select name="status" defaultValue={status} className="w-auto min-w-[160px]">
            <option value="">{t("allStatuses")}</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {tStatus(option)}
              </option>
            ))}
          </Select>
          <Select name="category" defaultValue={category} className="w-auto min-w-[160px]">
            <option value="">{t("allCategories")}</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {tCategory(option)}
              </option>
            ))}
          </Select>
          <Button type="submit" size="md">
            {t("search")}
          </Button>
        </form>

        <Card className="mt-6 bg-background !p-0">
          {allProspects.length === 0 ? (
            <p className="p-6 text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/50">
                  <th className="px-5 py-3 font-medium">{t("columns.id")}</th>
                  <th className="px-5 py-3 font-medium">{t("columns.name")}</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    {t("columns.category")}
                  </th>
                  <th className="px-5 py-3 font-medium">{t("columns.status")}</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    {t("columns.date")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {allProspects.map((prospect) => (
                  <tr key={prospect.id} className="border-b border-foreground/5 last:border-0">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/prospectos/${prospect.id}`}
                        className="font-medium text-brand-blue hover:underline"
                      >
                        {prospect.display_id}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-foreground">{prospect.contact_name}</td>
                    <td className="hidden px-5 py-4 text-foreground/60 sm:table-cell">
                      {tCategory(prospect.category)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          statusStyles[prospect.status],
                        )}
                      >
                        {tStatus(prospect.status)}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-foreground/60 sm:table-cell">
                      {new Date(prospect.created_at).toLocaleDateString(
                        locale === "en" ? "en-US" : "es-DO",
                      )}
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
