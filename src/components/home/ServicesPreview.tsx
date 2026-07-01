"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { servicePillars } from "@/lib/services-catalog";

export function ServicesPreview() {
  const t = useTranslations("Home.services");
  const tp = useTranslations("Services.pillars");
  const tCommon = useTranslations("Services");

  return (
    <Section>
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
              {t("eyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-foreground/70">{t("subtitle")}</p>
          </div>
          <Link href="/servicios" className={buttonVariants({ variant: "outline" })}>
            {t("ctaAll")}
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicePillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const bullets = tp.raw(`${pillar.slug}.bullets`) as string[];
            return (
              <motion.div
                key={pillar.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="flex h-full flex-col">
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
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
