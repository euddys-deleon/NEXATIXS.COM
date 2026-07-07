import { getTranslations } from "next-intl/server";
import { Cloud, Code2, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getNews } from "@/lib/news";

export const revalidate = 3600;

export async function generateMetadata() {
  const t = await getTranslations("News");
  return { title: t("title") };
}

const CATEGORY_ICONS: Record<string, typeof ShieldCheck> = {
  ciberseguridad: ShieldCheck,
  cloud: Cloud,
  desarrollo: Code2,
};

export default async function NoticiasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("News");
  const tCategory = await getTranslations("News.categories");
  const news = await getNews();
  const dateLocale = locale === "en" ? "en-US" : "es-DO";

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

          {news.length === 0 ? (
            <p className="mt-10 text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => {
                const Icon = CATEGORY_ICONS[item.category] ?? ShieldCheck;
                return (
                  <a
                    key={item.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-2xl border border-foreground/10 bg-background-subtle p-5 transition-colors hover:border-brand-blue/40"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-blue">
                      <Icon size={14} />
                      {tCategory(item.category)}
                    </div>
                    <p className="mt-3 flex-1 text-sm font-semibold leading-snug text-foreground group-hover:text-brand-blue">
                      {item.title}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-foreground/50">
                      <span>{item.source}</span>
                      {item.isoDate && (
                        <span>{new Date(item.isoDate).toLocaleDateString(dateLocale)}</span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
