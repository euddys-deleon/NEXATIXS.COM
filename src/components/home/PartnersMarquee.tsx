"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { partners } from "@/lib/partners";

export function PartnersMarquee() {
  const t = useTranslations("Home.partners");

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

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((cert, index) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              whileHover={{ y: -3 }}
              className="group flex flex-col items-center rounded-2xl border border-foreground/10 bg-background p-6 text-center transition-colors hover:border-brand-blue/40 hover:shadow-[0_0_28px_rgba(14,110,255,0.15)]"
            >
              <div className="flex h-14 w-full items-center justify-center">
                {cert.logoSrc ? (
                  <Image
                    src={cert.logoSrc}
                    alt={cert.name}
                    width={160}
                    height={56}
                    className="h-8 w-auto max-w-[140px] object-contain opacity-60 brightness-0 transition-opacity duration-300 group-hover:opacity-100 dark:invert"
                  />
                ) : (
                  <BadgeCheck className="text-brand-blue" size={28} strokeWidth={1.75} />
                )}
              </div>
              <p className="mt-4 font-heading text-sm font-semibold text-foreground">
                {cert.name}
              </p>
              <ul className="mt-3 w-full space-y-1.5 text-left text-xs leading-relaxed text-foreground/60">
                {cert.detail.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-blue" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
