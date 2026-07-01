import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export async function generateMetadata() {
  const t = await getTranslations("Legal.terms");
  return { title: t("title") };
}

export default async function TerminosDeServicioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Legal.terms");
  const sections = t.raw("sections") as { heading: string; body: string }[];
  const updatedDate = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date());

  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-foreground/50">{t("updated", { date: updatedDate })}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {section.heading}
                </h2>
                <p className="mt-2 leading-relaxed text-foreground/70">{section.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 rounded-xl border border-foreground/10 bg-background-subtle p-4 text-xs leading-relaxed text-foreground/50">
            {t("disclaimer")}
          </p>
        </Container>
      </Section>
    </main>
  );
}
