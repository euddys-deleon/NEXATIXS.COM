"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { partners } from "@/lib/partners";

export function PartnersMarquee() {
  const t = useTranslations("Home.partners");
  const track = [...partners, ...partners];

  return (
    <Section tone="subtle">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-foreground/70">{t("subtitle")}</p>
        </div>
      </Container>

      <div className="relative mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-16">
          {track.map((partner, index) => (
            <span
              key={`${partner.name}-${index}`}
              title={partner.detail}
              className="font-heading text-2xl font-bold text-foreground/40 transition-colors hover:text-brand-blue"
            >
              {partner.name}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
