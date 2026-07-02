"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ExternalLink, Headset, MessageCircle, Radar, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = [Headset, Radar, ShieldCheck, MessageCircle];

export function MayfrenSection() {
  const t = useTranslations("Home.mayfren");
  const features = t.raw("features") as string[];

  return (
    <Section id="mayfren" tone="subtle" className="scroll-mt-16">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
              {t("eyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-foreground/70">{t("subtitle")}</p>

            <a
              href="https://mayfren.lat/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-8")}
            >
              {t("cta")}
              <ExternalLink size={18} strokeWidth={2} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm"
          >
            <div className="flex items-center gap-1.5 border-b border-foreground/10 bg-foreground/[0.03] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 truncate text-xs text-foreground/40">mayfren.lat</span>
            </div>
            <div className="grid aspect-[16/10] grid-cols-2 gap-3 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-blue-dark/10 p-5">
              {features.map((label, index) => {
                const Icon = FEATURE_ICONS[index];
                return (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-background/60 p-3 text-center backdrop-blur-sm"
                  >
                    <Icon className="text-brand-blue" size={22} strokeWidth={1.75} />
                    <p className="text-xs font-medium text-foreground/70">{label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
