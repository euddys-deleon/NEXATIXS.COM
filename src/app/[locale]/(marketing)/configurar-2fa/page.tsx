"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { hardNavigateTo, resolveHomePath } from "@/lib/auth/resolve-home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// enrollData.totp.qr_code puede llegar como data URI (`data:image/svg+xml;...`)
// o como marcado SVG crudo segun la version del SDK. Insertarlo con
// dangerouslySetInnerHTML es fragil en ambos casos (en el segundo, ademas,
// el SVG trae width/height sin viewBox, asi que forzar su tamano por CSS solo
// lo recorta en vez de reescalarlo). Normalizamos siempre a una data URI y lo
// renderizamos con <img>, que si escala su contenido para caber en la caja
// sin recortar, tenga o no viewBox el SVG original.
function toImageSrc(qrCode: string): string {
  if (qrCode.startsWith("data:")) return qrCode;
  return `data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`;
}

export default function Configurar2faPage() {
  const t = useTranslations("Auth.setup2fa");
  const locale = useLocale();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
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
      if (verifiedFactor) {
        router.push("/verificar-2fa");
        return;
      }

      // Cada llamada a enroll() genera un secreto TOTP nuevo. Si queda un
      // factor sin verificar de un intento anterior (recarga de pagina,
      // navegacion hacia atras, etc.) hay que eliminarlo primero — de lo
      // contrario el usuario puede terminar escaneando/copiando un secreto
      // que ya no es el que se le va a pedir verificar, y ningun codigo de
      // su autenticador funcionara nunca para ese secreto huerfano.
      // factorsData.totp esta tipado (y filtrado por el SDK) para incluir
      // solo factores verificados; los no verificados solo aparecen en
      // .all, junto con factores de otros tipos, de ahi el filtro por
      // factor_type.
      const staleFactors =
        factorsData?.all?.filter((f) => f.factor_type === "totp" && f.status === "unverified") ?? [];
      for (const stale of staleFactors) {
        await supabase.auth.mfa.unenroll({ factorId: stale.id });
      }

      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "NEXATIXS Admin",
      });

      if (enrollError || !enrollData) {
        setError(t("genericError"));
        setLoading(false);
        return;
      }

      setFactorId(enrollData.id);
      setQrCode(enrollData.totp.qr_code);
      setSecret(enrollData.totp.secret);
      setLoading(false);
    }
    init();
  }, [router, t]);

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

    hardNavigateTo(locale, await resolveHomePath());
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

          {qrCode && (
            <div className="mt-6 flex items-center justify-center rounded-2xl border border-foreground/10 bg-white p-4">
              <img src={toImageSrc(qrCode)} alt={t("qrAlt")} className="h-48 w-48" />
            </div>
          )}

          {secret && (
            <p className="mt-3 break-all text-center text-xs text-foreground/50">
              {t("manualEntry")}: <span className="font-mono">{secret}</span>
            </p>
          )}

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
