"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { hardNavigateTo } from "@/lib/auth/resolve-home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function Verificar2faPage() {
  const t = useTranslations("Auth.verify2fa");
  const locale = useLocale();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"totp" | "recovery">("totp");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

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

    const response = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ factorId, code }),
    });
    const result = (await response.json()) as { ok: boolean; error?: string; destination?: string };

    if (!result.ok || !result.destination) {
      setSubmitting(false);
      setError(result.error === "rate_limited" ? t("rateLimited") : t("invalidCode"));
      return;
    }

    hardNavigateTo(locale, result.destination);
  }

  // A diferencia de la verificacion TOTP normal, canjear un codigo de
  // recuperacion NO eleva la sesion a aal2 por si mismo (eso solo lo hace el
  // propio challengeAndVerify() de Supabase contra un factor real). Lo que
  // hace es autorizar desenrolar el autenticador actual y mandar al usuario
  // a registrar uno nuevo desde cero — la rate limit real vive dentro de la
  // funcion SECURITY DEFINER, asi que sigue protegida aunque se llame directo
  // con la anon key.
  async function handleRecoverySubmit(event: React.FormEvent) {
    event.preventDefault();
    setRecoverySubmitting(true);
    setRecoveryError(null);

    const { data, error: rpcError } = await supabase.rpc("redeem_recovery_code", {
      p_code: recoveryCode,
      p_ip: "browser",
      p_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    });

    const result = data as { ok: boolean; error?: string } | null;

    if (rpcError || !result?.ok) {
      setRecoverySubmitting(false);
      setRecoveryError(
        result?.error === "rate_limited" ? t("recoveryRateLimited") : t("recoveryInvalidCode"),
      );
      return;
    }

    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    for (const factor of factorsData?.all ?? []) {
      if (factor.factor_type === "totp") {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }

    router.push("/configurar-2fa");
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

          {mode === "totp" ? (
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

              <button
                type="button"
                onClick={() => setMode("recovery")}
                className="block w-full text-center text-sm text-foreground/60 underline-offset-4 hover:text-brand-blue hover:underline"
              >
                {t("lostAuthenticator")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecoverySubmit} className="mt-8 space-y-5">
              <p className="text-sm text-foreground/60">{t("recoveryNote")}</p>

              <Field label={t("recoveryCodeLabel")} htmlFor="recoveryCode">
                <Input
                  id="recoveryCode"
                  autoComplete="off"
                  placeholder={t("recoveryCodePlaceholder")}
                  required
                  value={recoveryCode}
                  onChange={(event) => setRecoveryCode(event.target.value)}
                />
              </Field>

              {recoveryError && <p className="text-sm text-red-500">{recoveryError}</p>}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={recoverySubmitting || recoveryCode.trim().length === 0}
              >
                {recoverySubmitting ? t("recoverySubmitting") : t("recoverySubmit")}
              </Button>

              <button
                type="button"
                onClick={() => setMode("totp")}
                className="block w-full text-center text-sm text-foreground/60 underline-offset-4 hover:text-brand-blue hover:underline"
              >
                {t("backToCode")}
              </button>
            </form>
          )}
        </Container>
      </Section>
    </main>
  );
}
