"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { ConstellationBackground } from "./ConstellationBackground";

export function Hero() {
  const t = useTranslations("Home.hero");

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
            <Link href="/agendar-cita" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {t("ctaPrimary")}
            </Link>
            <Link
              href="/consulta-estatus"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
