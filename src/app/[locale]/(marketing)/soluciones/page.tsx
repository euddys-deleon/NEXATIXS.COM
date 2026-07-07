import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { servicePillars } from "@/lib/services-catalog";

export async function generateMetadata() {
  const t = await getTranslations("Solutions");
  return { title: t("title") };
}

export default async function SolucionesPage() {
  const t = await getTranslations("Solutions");
  const tCommon = await getTranslations("Services");
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicePillars.map((pillar) => {
              const Icon = pillar.icon;
              const bullets = tp.raw(`${pillar.slug}.bullets`) as string[];
              return (
                <Card key={pillar.slug} className="flex h-full flex-col">
                  <Icon className="text-brand-blue" size={24} />
                  <CardTitle className="mt-3">{tp(`${pillar.slug}.title`)}</CardTitle>
                  <CardDescription>{tp(`${pillar.slug}.summary`)}</CardDescription>
                  <ul className="mt-4 space-y-1.5 text-sm text-foreground/70">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/servicios/${pillar.slug}`}
                    className="mt-5 text-sm font-medium text-brand-blue hover:underline"
                  >
                    {tCommon("ctaMore")} →
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
