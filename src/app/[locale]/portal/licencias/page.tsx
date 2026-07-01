import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { getCategoryIcon } from "@/lib/portal-icons";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { RenewLicenseButton } from "@/components/portal/RenewLicenseButton";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  activa: "bg-emerald-500/10 text-emerald-600",
  por_vencer: "bg-amber-500/10 text-amber-600",
  expirada: "bg-red-500/10 text-red-600",
};

export default async function PortalLicenciasPage({
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

  const t = await getTranslations("Portal.licenses");
  const tStatus = await getTranslations("Estatus.licenseStatus");

  const { data: licenses } = await supabase
    .from("licenses")
    .select("id, name, category, status, expires_at")
    .eq("client_id", clientUser.client_id)
    .order("name");

  const allLicenses = licenses ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <Card className="mt-8 bg-background !p-0">
          {allLicenses.length === 0 ? (
            <p className="p-6 text-sm text-foreground/50">{t("empty")}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/50">
                  <th className="px-5 py-3 font-medium">{t("columns.name")}</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    {t("columns.category")}
                  </th>
                  <th className="px-5 py-3 font-medium">{t("columns.status")}</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    {t("columns.expires")}
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {allLicenses.map((license) => {
                  const Icon = getCategoryIcon(license.category);
                  return (
                    <tr key={license.id} className="border-b border-foreground/5 last:border-0">
                      <td className="flex items-center gap-2 px-5 py-4 font-medium text-foreground">
                        <Icon size={16} className="text-brand-blue" />
                        {license.name}
                      </td>
                      <td className="hidden px-5 py-4 text-foreground/60 sm:table-cell">
                        {license.category ?? t("noExpiry")}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            statusStyles[license.status],
                          )}
                        >
                          {tStatus(license.status)}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-foreground/60 sm:table-cell">
                        {license.expires_at
                          ? new Date(license.expires_at).toLocaleDateString(
                              locale === "en" ? "en-US" : "es-DO",
                            )
                          : t("noExpiry")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <RenewLicenseButton
                          clientId={clientUser.client_id}
                          licenseName={license.name}
                        />
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
