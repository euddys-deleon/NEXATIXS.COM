import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { leadershipTeam } from "@/lib/team";
import { LinkedInIcon } from "@/components/icons/SocialIcons";

export async function generateMetadata() {
  const t = await getTranslations("Nosotros");
  return { title: t("title") };
}

export default async function NosotrosPage() {
  const t = await getTranslations("Nosotros");
  const tRoot = await getTranslations();
  const team = tRoot.raw("Team") as { name: string; role: string; formation: string }[];
  const whyParagraphs = t.raw("whyParagraphs") as string[];

  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <Container>
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("eyebrow")}
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardTitle>{t("historyTitle")}</CardTitle>
              <CardDescription>{t("historyText")}</CardDescription>
            </Card>
            <Card>
              <CardTitle>{t("objectivesTitle")}</CardTitle>
              <CardDescription>{t("objectivesText")}</CardDescription>
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="subtle">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("teamTitle")}
          </h2>
          <p className="mt-3 text-foreground/70">{t("teamSubtitle")}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leadershipTeam.map((member, index) => {
              const info = team[index];
              return (
                <Card key={info.name} className="flex flex-col items-center text-center">
                  <span className="relative mx-auto block h-24 w-24 overflow-hidden rounded-full border border-foreground/10">
                    <Image
                      src={member.photo}
                      alt={info.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </span>
                  <CardTitle className="mt-4">{info.name}</CardTitle>
                  <p className="mt-1.5 text-sm font-semibold text-sky-400">{info.role}</p>
                  <CardDescription>{info.formation}</CardDescription>

                  <div className="mt-4 flex w-full justify-center border-t border-foreground/10 pt-4">
                    <a
                      href={member.linkedin ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn — ${info.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 text-foreground/50 transition-colors hover:border-sky-400/40 hover:text-sky-400"
                    >
                      <LinkedInIcon width={16} height={16} />
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("whyTitle")}
          </h2>
          <div className="mt-8 max-w-3xl space-y-5 text-foreground/70">
            {whyParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
