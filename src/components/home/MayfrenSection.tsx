"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BarChart3, ExternalLink, LayoutDashboard, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function MayfrenSection() {
  const t = useTranslations("Home.mayfren");

  return (
    <Section tone="subtle">
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
            <div className="flex aspect-[16/10] flex-col items-center justify-center gap-4 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-blue-dark/10 p-8 text-center">
              <LayoutDashboard className="text-brand-blue" size={40} strokeWidth={1.5} />
              <div className="flex items-center gap-6 text-foreground/40">
                <Users size={22} strokeWidth={1.5} />
                <BarChart3 size={22} strokeWidth={1.5} />
              </div>
              <p className="text-xs text-foreground/40">{t("previewSoon")}</p>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
