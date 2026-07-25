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
import { RecoveryCodesModal } from "@/components/auth/RecoveryCodesModal";

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

// El QR/secreto de un enrollment solo se puede leer una vez, en la respuesta
// de enroll() — Supabase no los vuelve a exponer despues por seguridad. Si el
// componente se vuelve a montar (recarga, refresh de Next, doble tab) despues
// de que el usuario ya escaneo el QR pero antes de verificar, sessionStorage
// deja reutilizar ese mismo enrollment pendiente en vez de crear uno nuevo —
// que invalidaria justo el codigo que el usuario ya tiene guardado en su
// autenticador.
const PENDING_ENROLLMENT_KEY = "nexatixs_pending_totp_factor";

type PendingEnrollment = { factorId: string; qrCode: string; secret: string };

function readPendingEnrollment(): PendingEnrollment | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ENROLLMENT_KEY);
    return raw ? (JSON.parse(raw) as PendingEnrollment) : null;
  } catch {
    return null;
  }
}

function writePendingEnrollment(value: PendingEnrollment) {
  try {
    sessionStorage.setItem(PENDING_ENROLLMENT_KEY, JSON.stringify(value));
  } catch {
    // Almacenamiento no disponible (modo privado, etc.) — el flujo sigue
    // funcionando, solo se pierde la resiliencia a un remount.
  }
}

function clearPendingEnrollment() {
  try {
    sessionStorage.removeItem(PENDING_ENROLLMENT_KEY);
  } catch {
    // no-op
  }
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
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

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
        clearPendingEnrollment();
        router.push("/verificar-2fa");
        return;
      }

      // factorsData.totp esta tipado (y filtrado por el SDK) para incluir
      // solo factores verificados; los no verificados solo aparecen en .all,
      // junto con factores de otros tipos, de ahi el filtro por factor_type.
      const unverifiedFactors =
        factorsData?.all?.filter((f) => f.factor_type === "totp" && f.status === "unverified") ?? [];

      // Si el usuario ya escaneo un QR en esta misma sesion de navegador
      // (guardado en sessionStorage) y ese factor sigue pendiente en el
      // servidor, lo reutilizamos tal cual en vez de generar uno nuevo — de
      // lo contrario un simple remount del componente (recarga, Fast
      // Refresh, volver atras) invalidaria el codigo que el usuario ya tiene
      // en su autenticador, aunque nunca haya fallado nada.
      const pending = readPendingEnrollment();
      if (pending && unverifiedFactors.some((f) => f.id === pending.factorId)) {
        setFactorId(pending.factorId);
        setQrCode(pending.qrCode);
        setSecret(pending.secret);
        setLoading(false);
        return;
      }

      // No hay un enrollment pendiente reutilizable: cualquier factor sin
      // verificar que quede (de un intento anterior en otra pestaña/sesion,
      // o uno que ya no coincide con lo guardado localmente) hay que
      // eliminarlo antes de crear uno nuevo — Supabase no vuelve a exponer
      // el secreto/QR de un factor ya creado, asi que no hay forma de
      // "recuperar" uno huerfano, solo reemplazarlo.
      for (const stale of unverifiedFactors) {
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
      writePendingEnrollment({
        factorId: enrollData.id,
        qrCode: enrollData.totp.qr_code,
        secret: enrollData.totp.secret,
      });
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

    clearPendingEnrollment();

    // Los codigos de recuperacion se generan una sola vez, justo despues de
    // la primera verificacion exitosa, y se muestran de inmediato — es la
    // unica oportunidad que tiene el usuario de verlos en claro.
    const { data: codes } = await supabase.rpc("generate_recovery_codes");
    setSubmitting(false);

    if (codes && codes.length > 0) {
      setRecoveryCodes(codes);
      return;
    }

    hardNavigateTo(locale, await resolveHomePath());
  }

  async function handleRecoveryCodesContinue() {
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

      {recoveryCodes && (
        <RecoveryCodesModal codes={recoveryCodes} onClose={handleRecoveryCodesContinue} />
      )}
    </main>
  );
}
