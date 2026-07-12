import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { AddPlanForm } from "@/components/admin/AddPlanForm";
import { PlanRow } from "@/components/admin/PlanRow";

const CATEGORIES = ["web", "herramientas", "redes_sociales"];

export default async function AdminPlanesPage({
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

  const t = await getTranslations("Admin.plans");

  const { data: plans } = await supabase
    .from("plans")
    .select(
      "id, category, name, price, currency, billing_period, description, features, is_featured, display_order, active",
    )
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  const allPlans = plans ?? [];

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
            <AddPlanForm />
          </div>
        </Card>

        {CATEGORIES.map((category) => {
          const categoryPlans = allPlans.filter((plan) => plan.category === category);
          return (
            <div key={category} className="mt-10">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {t(`categories.${category}`)}
              </h2>
              <div className="mt-4 space-y-3">
                {categoryPlans.length === 0 ? (
                  <p className="text-sm text-foreground/60">{t("empty")}</p>
                ) : (
                  categoryPlans.map((plan) => <PlanRow key={plan.id} plan={plan} />)
                )}
              </div>
            </div>
          );
        })}
      </Container>
    </Section>
  );
}
