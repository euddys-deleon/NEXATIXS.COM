"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { resolveHomePath } from "@/lib/auth/resolve-home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function Verificar2faPage() {
  const t = useTranslations("Auth.verify2fa");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/iniciar-sesion");
        return;
      }

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factorsData?.totp?.find((f) => f.status === "verified");

      if (!verifiedFactor) {
        router.push("/configurar-2fa");
        return;
      }

      setFactorId(verifiedFactor.id);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!factorId) return;
    setSubmitting(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (verifyError) {
      setSubmitting(false);
      setError(t("invalidCode"));
      return;
    }

    router.push(await resolveHomePath());
    router.refresh();
  }

  if (loading) return null;

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

          <form onSubmit={handleVerify} className="mt-8 space-y-5">
            <Field label={t("codeLabel")} htmlFor="code">
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={submitting || code.length !== 6}>
              {submitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Container>
      </Section>
    </main>
  );
}
