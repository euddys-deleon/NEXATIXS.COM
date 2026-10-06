import { getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardTitle } from "@/components/ui/Card";
import { ContactForm } from "@/components/contacto/ContactForm";

export async function generateMetadata() {
  const t = await getTranslations("Contact");
  return { title: t("title") };
}

export default async function ContactoPage() {
  const t = await getTranslations("Contact");

  const contactMethods = [
    { icon: Phone, label: t("phoneLabel"), value: "(829) 268-0004", href: "tel:+18292680004" },
    {
      icon: Mail,
      label: t("emailLabel"),
      value: "contacto@nexatixs.com",
      href: "mailto:contacto@nexatixs.com",
    },
    { icon: Clock, label: t("hoursLabel"), value: t("hoursValue"), href: null },
    { icon: MapPin, label: t("locationLabel"), value: t("locationValue"), href: null },
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mt-8 mx-auto max-w-xl">
            <ContactForm />
          </div>
        </Container>
      </Section>
    </main>
  );
}
