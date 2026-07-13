"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { hardNavigateTo, resolveHomePath } from "@/lib/auth/resolve-home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function IniciarSesionPage() {
  const t = useTranslations("Login");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      setSubmitting(false);
      setError(
        signInError?.message.toLowerCase().includes("invalid")
          ? t("invalidCredentials")
          : t("genericError"),
      );
      return;
    }

    const destination = await resolveHomePath();

    setSubmitting(false);
    hardNavigateTo(locale, destination);
  }

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

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label={t("email")} htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label={t("password")} htmlFor="password">
              <PasswordInput
                id="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t("submitting") : t("submit")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            {t("noAccount")}{" "}
            <Link href="/agendar-cita" className="font-medium text-brand-blue hover:underline">
              {t("requestAccess")}
            </Link>
          </p>
        </Container>
      </Section>
    </main>
  );
}
