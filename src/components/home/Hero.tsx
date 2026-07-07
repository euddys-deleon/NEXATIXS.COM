"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Cloud, Code2, Headset, Settings2, Shield } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { ConstellationBackground } from "./ConstellationBackground";

const HIGHLIGHT_ICONS = [Shield, Cloud, Code2, Settings2, Headset];

export function Hero() {
  const t = useTranslations("Home.hero");
  const highlights = t.raw("highlights") as string[];

  return (
    <section className="relative overflow-hidden bg-background">
      <ConstellationBackground className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      <Container className="relative py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("eyebrow")}
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/70">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/servicios" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {t("ctaPrimary")} →
            </Link>
            <Link
              href="/agendar-cita"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-16 flex flex-wrap gap-x-8 gap-y-4"
        >
          {highlights.map((label, index) => {
            const Icon = HIGHLIGHT_ICONS[index];
            return (
              <div key={label} className="flex items-center gap-2 text-sm text-foreground/70">
                <Icon className="text-brand-blue" size={18} strokeWidth={1.75} />
                {label}
              </div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
