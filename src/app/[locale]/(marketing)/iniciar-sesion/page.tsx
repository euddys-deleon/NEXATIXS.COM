import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { LoginForm } from "./LoginForm";

type CallbackError = "oauth_error" | "no_account";

function parseError(raw: string | undefined): CallbackError | undefined {
  return raw === "oauth_error" || raw === "no_account" ? raw : undefined;
}

export default async function IniciarSesionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const t = await getTranslations("Login");

  return (
    <main className="flex flex-1 flex-col">
      <Section className="flex flex-1 items-center">
        <Container className="max-w-md">
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("eyebrow")}
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

          <LoginForm initialError={parseError(error)} />
        </Container>
      </Section>
    </main>
  );
}
