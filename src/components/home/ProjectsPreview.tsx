"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { projects } from "@/lib/projects-catalog";

export function ProjectsPreview() {
  const t = useTranslations("Home.projects");
  const tp = useTranslations("Projects.items");

  return (
    <Section tone="subtle">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
              {t("eyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-foreground/70">{t("subtitle")}</p>
          </div>
          <Link href="/proyectos" className={buttonVariants({ variant: "outline" })}>
            {t("ctaAll")}
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {projects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="flex h-full flex-col">
                <span className="relative block h-12 w-12">
                  <Image
                    src={project.logo}
                    alt={tp(`${project.slug}.title`)}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </span>
                <CardTitle className="mt-3">{tp(`${project.slug}.title`)}</CardTitle>
                <CardDescription>{tp(`${project.slug}.summary`)}</CardDescription>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
                >
                  {tp(`${project.slug}.cta`)}
                  <ExternalLink size={14} />
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
