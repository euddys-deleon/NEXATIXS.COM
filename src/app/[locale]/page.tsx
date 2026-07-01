import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <Container>
          <div className="mb-10 flex items-center justify-between">
            <span className="font-heading text-sm font-semibold tracking-wide text-foreground/60">
              NEXATIXS — Design System (Fase 1)
            </span>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-foreground/70">{t("tagline")}</p>
          <p className="mt-2 max-w-md text-sm text-foreground/50">{t("placeholder")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="primary" size="lg">
              Agendar cita
            </Button>
            <Button variant="outline" size="lg">
              Consulta tu estatus
            </Button>
            <Button variant="ghost" size="md">
              Ghost
            </Button>
          </div>
        </Container>
      </Section>

      <Section tone="subtle">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardTitle>Desarrollo</CardTitle>
              <CardDescription>
                Software a medida, apps web y móviles, APIs, ERP y CRM.
              </CardDescription>
              <CardContent>
                <Button variant="outline" size="sm">
                  Ver más
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardTitle>Ciberseguridad</CardTitle>
              <CardDescription>
                Firewalls, auditorías, pentesting, backups y recuperación ante desastres.
              </CardDescription>
              <CardContent>
                <Button variant="outline" size="sm">
                  Ver más
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardTitle>Cloud</CardTitle>
              <CardDescription>
                Azure, AWS, Google Cloud, Microsoft 365 y Google Workspace.
              </CardDescription>
              <CardContent>
                <Button variant="outline" size="sm">
                  Ver más
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </main>
  );
}
