"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Award,
  ClipboardCheck,
  Eye,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

const valueIcons = [Lightbulb, ShieldCheck, Award, HeartHandshake, ClipboardCheck, Eye];

export function ValuesGrid() {
  const t = useTranslations("Home.reason");
  const values = t.raw("values") as { title: string; description: string }[];

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
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card>
            <CardTitle>{t("missionTitle")}</CardTitle>
            <CardDescription>{t("missionText")}</CardDescription>
          </Card>
          <Card>
            <CardTitle>{t("visionTitle")}</CardTitle>
            <CardDescription>{t("visionText")}</CardDescription>
          </Card>
        </div>

        <h3 className="mt-16 font-heading text-xl font-semibold text-foreground">
          {t("valuesTitle")}
        </h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => {
            const Icon = valueIcons[index % valueIcons.length];
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Card className="h-full bg-background">
                  <Icon className="text-brand-blue" size={22} />
                  <CardTitle className="mt-3">{value.title}</CardTitle>
                  <CardDescription>{value.description}</CardDescription>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
