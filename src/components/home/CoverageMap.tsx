"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { coverageLocations } from "@/lib/coverage";

const MapCanvas = dynamic(() => import("./MapCanvas").then((m) => m.MapCanvas), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-foreground/5" />,
});

export function CoverageMap() {
  const t = useTranslations("Home.coverage");

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

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-[420px] overflow-hidden rounded-2xl border border-foreground/10">
            <MapCanvas />
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
              {t("hqLabel")}
            </p>
            <p className="mt-1 font-heading text-lg font-semibold text-foreground">
              {t("hqValue")}
            </p>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-foreground/60">
              {t("presenceLabel")}
            </p>

            <div className="mt-3">
              <p className="text-sm font-semibold text-foreground">{t("countryDO")}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {coverageLocations.DO.map((loc) => (
                  <li
                    key={loc.name}
                    className="rounded-full bg-foreground/5 px-3 py-1 text-xs text-foreground/70"
                  >
                    {loc.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground">{t("countryUS")}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {coverageLocations.US.map((loc) => (
                  <li
                    key={loc.name}
                    className="rounded-full bg-foreground/5 px-3 py-1 text-xs text-foreground/70"
                  >
                    {loc.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
