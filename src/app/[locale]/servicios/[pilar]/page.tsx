import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { getServicePillar, servicePillars } from "@/lib/services-catalog";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return servicePillars.map((pillar) => ({ pilar: pillar.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pilar: string }>;
}) {
  const { pilar } = await params;
  const pillar = getServicePillar(pilar);
  if (!pillar) return {};
  const tp = await getTranslations("Services.pillars");
  return { title: tp(`${pilar}.title`) };
}

export default async function ServicioDetallePage({
  params,
}: {
  params: Promise<{ pilar: string }>;
}) {
  const { pilar } = await params;
  const pillar = getServicePillar(pilar);
  if (!pillar) notFound();

  const t = await getTranslations("Services");
  const tp = await getTranslations("Services.pillars");
  const items = tp.raw(`${pillar.slug}.items`) as string[];
  const Icon = pillar.icon;

  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <Container>
          <Link href="/servicios" className="text-sm font-medium text-brand-blue hover:underline">
            ← {t("backToAll")}
          </Link>

          <div className="mt-6 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
              <Icon size={28} />
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {tp(`${pillar.slug}.title`)}
            </h1>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-foreground/70">
            {tp(`${pillar.slug}.summary`)}
          </p>

          <div className="mt-10 max-w-2xl rounded-2xl border border-foreground/10 bg-background-subtle p-6">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/50">
              {t("detailTitle")}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 size={16} className="shrink-0 text-brand-blue" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/agendar-cita"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-10")}
          >
            {t("ctaMore")}
          </Link>
        </Container>
      </Section>
    </main>
  );
}
