import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  prospecto: "bg-blue-500/10 text-blue-600",
  en_evaluacion: "bg-amber-500/10 text-amber-600",
  cliente_activo: "bg-emerald-500/10 text-emerald-600",
  descartado: "bg-foreground/10 text-foreground/60",
};

export default async function AdminProspectosPage({
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

  const t = await getTranslations("Admin.prospects");

  const { data: prospects } = await supabase
    .from("prospects")
    .select("id, display_id, contact_name, category, status, created_at")
    .order("created_at", { ascending: false });

  const allProspects = prospects ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <Card className="mt-8 bg-background !p-0">
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
                      {prospect.category}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          statusStyles[prospect.status],
                        )}
                      >
                        {prospect.status}
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
