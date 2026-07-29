"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ExternalLink, Package, Receipt } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// No hay un archivo de logo real disponible (la imagen se compartio en el
// chat, no como archivo en disco) — se recrea el isotipo como SVG en linea,
// aproximando los colores/forma de la marca real en vez de usar una captura.
function KontaoLogo() {
  return (
    <svg viewBox="0 0 32 32" className="h-10 w-10" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0E7A4C" />
      <path
        d="M11 7v18M11 16l8-9M11 16l8 9"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="22" cy="10" r="2.5" fill="#F5C518" />
    </svg>
  );
}

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
            <div className="flex items-center gap-3">
              <KontaoLogo />
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                KONTAO
              </span>
            </div>
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
            <div className="space-y-4 bg-gradient-to-br from-[#0E7A4C]/5 via-transparent to-[#F5C518]/5 p-5">
              <div className="flex items-center justify-between text-xs text-foreground/50">
                <span>{t("panelLabel")}</span>
                <span className="font-medium text-foreground/70">{t("panelBusiness")}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1 rounded-xl bg-[#0E7A4C] p-4 text-white">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>{t("salesLabel")}</span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium">
                      {t("salesChange")}
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold">{t("salesValue")}</p>
                </div>
                <div className="col-span-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-background/60 p-3 backdrop-blur-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E7A4C]/10 text-[#0E7A4C]">
                      <Package size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t("productsValue")}</p>
                      <p className="text-[10px] text-foreground/50">{t("productsLabel")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-background/60 p-3 backdrop-blur-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5C518]/20 text-[#a6820a]">
                      <Receipt size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t("pendingValue")}</p>
                      <p className="text-[10px] text-foreground/50">{t("pendingLabel")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-foreground/10 bg-background/60 p-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-foreground/70">{t("recentSalesTitle")}</p>
                <p className="mt-2 text-[10px] text-foreground/40">{t("footerNote")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
