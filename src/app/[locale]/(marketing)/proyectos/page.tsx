import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/projects-catalog";

export async function generateMetadata() {
  const t = await getTranslations("Projects");
  return { title: t("title") };
}

export default async function ProyectosPage() {
  const t = await getTranslations("Projects");
  const tp = await getTranslations("Projects.items");

  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <Container>
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("eyebrow")}
          </span>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-foreground/70">{t("subtitle")}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => {
              const tags = tp.raw(`${project.slug}.tags`) as string[];
              return (
                <Card key={project.slug} className="flex h-full flex-col">
                  <span className="relative block h-14 w-14">
                    <Image
                      src={project.logo}
                      alt={tp(`${project.slug}.title`)}
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </span>
                  <CardTitle className="mt-4 text-xl">{tp(`${project.slug}.title`)}</CardTitle>
                  <CardDescription>{tp(`${project.slug}.description`)}</CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
                  >
                    {tp(`${project.slug}.cta`)}
                    <ExternalLink size={14} />
                  </a>
                </Card>
              );
            })}
          </div>

          <Card className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t("ctaBoxTitle")}</CardTitle>
              <CardDescription>{t("ctaBoxText")}</CardDescription>
            </div>
            <Link href="/contacto" className={cn(buttonVariants({ variant: "primary" }), "shrink-0")}>
              {t("ctaBoxButton")}
            </Link>
          </Card>
        </Container>
      </Section>
    </main>
  );
}
