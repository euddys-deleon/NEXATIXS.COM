import { getTranslations } from "next-intl/server";
import { Check, Globe, LayoutGrid, Share2, Sparkles, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const t = await getTranslations("Plans");
  return { title: t("title") };
}

const CATEGORIES = [
  { key: "mayfren", icon: LayoutGrid },
  { key: "web", icon: Globe },
  { key: "herramientas", icon: Wrench },
  { key: "redes_sociales", icon: Share2 },
] as const;

export default async function PlanesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Plans");
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("plans")
    .select(
      "id, category, name, price, annual_price, currency, billing_period, description, features, is_featured",
    )
    .eq("active", true)
    .order("display_order", { ascending: true });

  const allPlans = plans ?? [];
  const dateLocale = locale === "en" ? "en-US" : "es-DO";

  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <Container>
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("eyebrow")}
          </span>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-foreground/70">{t("subtitle")}</p>

          {CATEGORIES.map((cat) => {
            const catPlans = allPlans.filter((p) => p.category === cat.key);
            if (catPlans.length === 0) return null;
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="mt-16">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {t(`categories.${cat.key}`)}
                  </h2>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {catPlans.map((plan) => {
                    const features = (plan.features as string[]) ?? [];
                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          "flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:shadow-[0_0_28px_rgba(14,110,255,0.25)]",
                          plan.is_featured
                            ? "border-brand-blue bg-background shadow-sm"
                            : "border-foreground/10 bg-background-subtle",
                        )}
                      >
                        {plan.is_featured && (
                          <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">
                            <Sparkles size={12} /> {t("featured")}
                          </span>
                        )}
                        <p className="font-heading text-lg font-semibold text-foreground">
                          {plan.name}
                        </p>
                        {plan.description && (
                          <p className="mt-1 text-sm text-foreground/60">{plan.description}</p>
                        )}
                        <div className="mt-4">
                          {plan.price != null ? (
                            <>
                              <p>
                                <span className="font-heading text-3xl font-bold text-foreground">
                                  {plan.currency}{" "}
                                  {plan.price.toLocaleString(dateLocale, {
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                                <span className="ml-1 text-sm text-foreground/50">
                                  {plan.billing_period === "mensual"
                                    ? t("perMonth")
                                    : plan.billing_period === "anual"
                                      ? t("perYear")
                                      : t("oneTime")}
                                </span>
                              </p>
                              {plan.annual_price != null && (
                                <p className="mt-1 text-xs text-brand-blue">
                                  {t("annualPrice", {
                                    price: `${plan.currency} ${plan.annual_price.toLocaleString(
                                      dateLocale,
                                      { maximumFractionDigits: 2 },
                                    )}`,
                                  })}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="font-heading text-xl font-bold text-foreground">
                              {t("contactForPrice")}
                            </span>
                          )}
                        </div>
                        <ul className="mt-5 flex-1 space-y-2 text-sm text-foreground/70">
                          {features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <Check size={16} className="mt-0.5 shrink-0 text-brand-blue" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Link
                          href="/agendar-cita"
                          className={cn(
                            buttonVariants({ variant: plan.is_featured ? "primary" : "outline" }),
                            "mt-6 w-full",
                          )}
                        >
                          {plan.price != null ? t("cta") : t("quoteCta")}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="mt-16 rounded-2xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue-dark to-brand-blue p-8 text-white sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("customTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-white/85">{t("customSubtitle")}</p>
            <Link
              href="/agendar-cita"
              className={cn(
                buttonVariants({ variant: "primary", size: "lg" }),
                "mt-6 bg-white text-brand-blue-dark hover:bg-white/90",
              )}
            >
              {t("customCta")}
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
