"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function KontaoSection() {
  const t = useTranslations("Home.kontao");

  return (
    <Section id="kontao" tone="subtle" className="scroll-mt-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="relative block h-14 w-14">
              <Image
                src="/assets/brand/kontao/logo-icon.png"
                alt="KONTAO"
                fill
                sizes="56px"
                className="object-contain"
              />
            </span>
            <span className="mt-4 block font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
              {t("eyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-foreground/70">{t("subtitle")}</p>

            <a
              href="https://www.kontao.lat/"
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
              <span className="ml-3 truncate text-xs text-foreground/40">kontao.lat</span>
            </div>
            <div className="relative aspect-[741/722] w-full">
              <Image
                src="/assets/brand/kontao/interfaz-ejemplo.png"
                alt={t("title")}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
