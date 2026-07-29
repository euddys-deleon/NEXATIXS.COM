import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { MayfrenSection } from "@/components/home/MayfrenSection";
import { KontaoSection } from "@/components/home/KontaoSection";
import { servicePillars } from "@/lib/services-catalog";

export async function generateMetadata() {
  const t = await getTranslations("Marketplace");
  return { title: t("title") };
}

export default async function HerramientasPage() {
  const t = await getTranslations("Marketplace");
  const tp = await getTranslations("Services.pillars");

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
        </Container>
      </Section>

      <MayfrenSection />
      <KontaoSection />

      <Section>
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("comingSoonTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-foreground/70">{t("comingSoonSubtitle")}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.slug} className="flex h-full flex-col">
                  <Icon className="text-brand-blue" size={24} />
                  <CardTitle className="mt-3">{tp(`${pillar.slug}.title`)}</CardTitle>
                  <CardDescription>{t("comingSoonCardText")}</CardDescription>
                  <Link
                    href="/agendar-cita"
                    className="mt-5 text-sm font-medium text-brand-blue hover:underline"
                  >
                    {t("comingSoonCta")} →
                  </Link>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>
    </main>
  );
}
