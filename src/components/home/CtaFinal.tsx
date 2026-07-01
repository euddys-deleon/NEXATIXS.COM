"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function CtaFinal() {
  const t = useTranslations("Home.ctaFinal");

  return (
    <Section className="bg-gradient-to-br from-brand-blue-dark via-brand-blue-dark to-brand-blue text-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-white/80">{t("subtitle")}</p>
          <Link
            href="/agendar-cita"
            className={cn(
              buttonVariants({ variant: "primary", size: "lg" }),
              "mt-8 bg-white text-brand-blue-dark hover:bg-white/90",
            )}
          >
            {t("cta")}
          </Link>
        </motion.div>
      </Container>
    </Section>
  );
}
