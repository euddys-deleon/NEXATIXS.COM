import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { AddServiceForm } from "@/components/admin/AddServiceForm";
import { ServiceRow } from "@/components/admin/ServiceRow";
import { servicePillars } from "@/lib/services-catalog";

export default async function AdminServiciosPage({
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

  const t = await getTranslations("Admin.services");

  const { data: services } = await supabase
    .from("services_catalog")
    .select("id, pillar_slug, item_name, is_upsell_eligible")
    .order("pillar_slug", { ascending: true })
    .order("item_name", { ascending: true });

  const allServices = services ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <Card className="mt-6">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
            {t("addTitle")}
          </h2>
          <div className="mt-4">
            <AddServiceForm />
          </div>
        </Card>

        {servicePillars.map((pillar) => {
          const pillarServices = allServices.filter((service) => service.pillar_slug === pillar.slug);
          return (
            <div key={pillar.slug} className="mt-10">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                <pillar.icon size={18} className="text-brand-blue" />
                {t(`pillars.${pillar.slug}`)}
              </h2>
              <div className="mt-4 space-y-3">
                {pillarServices.length === 0 ? (
                  <p className="text-sm text-foreground/60">{t("empty")}</p>
                ) : (
                  pillarServices.map((service) => <ServiceRow key={service.id} service={service} />)
                )}
              </div>
            </div>
          );
        })}
      </Container>
    </Section>
  );
}
