import { getTranslations } from "next-intl/server";
import { CalendarCheck, Clock, Mail, Phone, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { SupportForm } from "@/components/support/SupportForm";

export async function generateMetadata() {
  const t = await getTranslations("Support");
  return { title: t("title") };
}

export default async function SoportePage() {
  const t = await getTranslations("Support");

  const contactMethods = [
    { icon: Phone, label: t("phoneLabel"), value: "(829) 268-0004", href: "tel:+18292680004" },
    {
      icon: Mail,
      label: t("emailLabel"),
      value: "soporte@nexatixs.com",
      href: "mailto:soporte@nexatixs.com",
    },
    { icon: Clock, label: t("hoursLabel"), value: t("hoursValue"), href: null },
  ];

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

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {contactMethods.map((method) => (
              <Card key={method.label} className="text-center">
                <method.icon className="mx-auto text-brand-blue" size={24} />
                <CardTitle className="mt-3 text-base">{method.label}</CardTitle>
                {method.href ? (
                  <a href={method.href} className="mt-1 block text-sm text-foreground/70 hover:text-brand-blue">
                    {method.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-foreground/70">{method.value}</p>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Card>
              <Search className="text-brand-blue" size={24} />
              <CardTitle className="mt-3">{t("statusTitle")}</CardTitle>
              <CardDescription>{t("statusText")}</CardDescription>
              <Link
                href="/consulta-estatus"
                className="mt-5 inline-block text-sm font-medium text-brand-blue hover:underline"
              >
                {t("statusCta")} →
              </Link>
            </Card>
            <Card>
              <CalendarCheck className="text-brand-blue" size={24} />
              <CardTitle className="mt-3">{t("adviceTitle")}</CardTitle>
              <CardDescription>{t("adviceText")}</CardDescription>
              <Link
                href="/agendar-cita"
                className="mt-5 inline-block text-sm font-medium text-brand-blue hover:underline"
              >
                {t("adviceCta")} →
              </Link>
            </Card>
          </div>

          <div className="mt-8 mx-auto max-w-xl">
            <SupportForm />
          </div>
        </Container>
      </Section>
    </main>
  );
}
