"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Building2, Globe, MapPin, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { coverageLocations, type CountryKey } from "@/lib/coverage";

const MapCanvas = dynamic(() => import("./MapCanvas").then((m) => m.MapCanvas), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-foreground/5" />,
});

const TABS: CountryKey[] = ["DO", "US"];

export function CoverageMap() {
  const t = useTranslations("Home.coverage");
  const [country, setCountry] = useState<CountryKey>("DO");

  const stats = [
    { icon: Building2, label: t("stats.hq"), value: "1" },
    { icon: MapPin, label: t("stats.provinces"), value: String(coverageLocations.DO.length + 1) },
    { icon: Globe, label: t("stats.international"), value: t("stats.internationalValue") },
    { icon: Zap, label: t("stats.support"), value: t("stats.supportValue") },
  ];

  const cities = coverageLocations[country];
  const countryLabel = country === "DO" ? t("countryDO") : t("countryUS");

  return (
    <Section tone="subtle">
      <Container>
        <div className="max-w-2xl">
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-foreground/70">{t("subtitle")}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-foreground/10 bg-background/60 p-4 backdrop-blur-sm transition-shadow hover:shadow-sm"
            >
              <stat.icon className="text-brand-blue" size={18} strokeWidth={1.75} />
              <p className="mt-2 font-heading text-xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-foreground/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-foreground/10 bg-background/60 p-1 backdrop-blur-sm">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCountry(key)}
              className={cn(
                "relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                country === key ? "text-white" : "text-foreground/60 hover:text-foreground",
              )}
            >
              {country === key && (
                <motion.span
                  layoutId="coverage-tab-pill"
                  className="absolute inset-0 rounded-full bg-brand-blue"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                />
              )}
              <span className="relative z-10">
                {key === "DO" ? t("countryDO") : t("countryUS")}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="h-[420px] overflow-hidden rounded-2xl border border-foreground/10"
          >
            <MapCanvas country={country} />
          </motion.div>

          <div className="rounded-2xl border border-foreground/10 bg-background/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                <MapPin size={16} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  {t("presenceLabel")}
                </p>
                <p className="font-heading text-sm font-semibold text-foreground">
                  {countryLabel}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={country}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-5 flex flex-wrap gap-2"
              >
                {cities.map((loc, index) => (
                  <motion.span
                    key={loc.name}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    whileHover={{ y: -2 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-foreground"
                  >
                    <MapPin size={12} className="text-brand-blue" strokeWidth={2} />
                    {loc.name}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </Section>
  );
}
