"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { PipelineTimeline } from "./PipelineTimeline";

type StatusResult =
  | { found: false }
  | {
      found: true;
      displayId: string;
      status: string;
      isClient: false;
      pipelinePhase: string;
      createdAt: string;
    }
  | {
      found: true;
      displayId: string;
      status: string;
      isClient: true;
      companyName: string;
      projects: { name: string; status: string }[];
      licenses: { name: string; status: string }[];
    };

type Step = "identify" | "otp" | "result";

export function ConsultaEstatusClient() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Estatus.page");
  const tProjectStatus = useTranslations("Estatus.projectStatus");
  const tLicenseStatus = useTranslations("Estatus.licenseStatus");

  const [step, setStep] = useState<Step>("identify");
  const [id, setId] = useState(searchParams.get("id") ?? "");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResult | null>(null);

  async function handleRequestOtp(event: React.FormEvent) {
    event.preventDefault();
    if (!id.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/estatus/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayId: id, email }),
      });
      const data = (await response.json()) as { ok: boolean; rateLimited?: boolean };

      if (!response.ok || !data.ok) {
        setError(t("errorGeneric"));
        return;
      }

      if (data.rateLimited) {
        setError(t("rateLimited"));
        return;
      }

      // Siempre avanzamos al paso del código, exista o no la solicitud/correo:
      // que el formulario "sepa" cuál de los dos falló sería la misma fuga de
      // información que este flujo existe para cerrar.
      setStep("otp");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) return;

    setLoading(true);
    setError(null);

    try {
      const verifyResponse = await fetch("/api/estatus/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayId: id, otp }),
      });
      const verifyData = (await verifyResponse.json()) as {
        ok: boolean;
        locked?: boolean;
        token?: string;
      };

      if (!verifyResponse.ok || !verifyData.ok || !verifyData.token) {
        setError(verifyData.locked ? t("otpLocked") : t("otpInvalid"));
        return;
      }

      const statusResponse = await fetch("/api/estatus/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayId: id, token: verifyData.token }),
      });
      const statusData = (await statusResponse.json()) as StatusResult | { found: false; expired?: boolean };

      setResult(statusData as StatusResult);
      setStep("result");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <Container className="max-w-2xl">
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {t("eyebrow")}
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-foreground/70">{t("subtitle")}</p>

          {step === "identify" && (
            <form onSubmit={handleRequestOtp} className="mt-8 flex flex-col gap-3">
              <Input
                value={id}
                onChange={(event) => setId(event.target.value)}
                placeholder={t("placeholder")}
                aria-label={t("title")}
              />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("emailPlaceholder")}
                aria-label={t("emailPlaceholder")}
              />
              <Button type="submit" disabled={loading}>
                {loading ? t("searching") : t("verifyCta")}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-8 flex flex-col gap-3">
              <p className="text-sm text-foreground/70">{t("otpSentHelp")}</p>
              <Input
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("otpPlaceholder")}
                aria-label={t("otpPlaceholder")}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={loading}>
                  {loading ? t("searching") : t("otpCta")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("identify");
                    setOtp("");
                    setError(null);
                  }}
                >
                  {t("backCta")}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <p className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {step === "result" && result && !result.found && (
            <p className="mt-8 rounded-xl border border-dashed border-foreground/20 p-6 text-center text-sm text-foreground/60">
              {t("notFound")}
            </p>
          )}

          {step === "result" && result && result.found && !result.isClient && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground">{t("prospectTitle")}</h2>
              <p className="mt-1 text-sm text-foreground/60">
                {t("prospectSubtitle", {
                  id: result.displayId,
                  date: new Date(result.createdAt).toLocaleDateString(
                    locale === "en" ? "en-US" : "es-DO",
                  ),
                })}
              </p>

              {result.status === "descartado" ? (
                <p className="mt-6 rounded-xl border border-dashed border-foreground/20 p-4 text-sm text-foreground/60">
                  {t("discarded")}
                </p>
              ) : (
                <div className="mt-8">
                  <PipelineTimeline currentPhase={result.pipelinePhase} />
                  {result.status === "en_evaluacion" && (
                    <p className="mt-6 text-sm text-foreground/60">{t("underReview")}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === "result" && result && result.found && result.isClient && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground">
                {t("clientTitle", { company: result.companyName })}
              </h2>
              <p className="mt-1 text-sm text-foreground/60">{t("clientSubtitle")}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Card>
                  <p className="text-3xl font-bold text-brand-blue">{result.projects.length}</p>
                  <p className="mt-1 text-sm text-foreground/60">{t("activeProjects")}</p>
                </Card>
                <Card>
                  <p className="text-3xl font-bold text-brand-blue">{result.licenses.length}</p>
                  <p className="mt-1 text-sm text-foreground/60">{t("activeLicenses")}</p>
                </Card>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                    {t("projectsListTitle")}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {result.projects.length === 0 && (
                      <li className="text-sm text-foreground/60">{t("noProjects")}</li>
                    )}
                    {result.projects.map((project) => (
                      <li
                        key={project.name}
                        className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2 text-sm"
                      >
                        <span>{project.name}</span>
                        <span className="text-xs font-medium text-brand-blue">
                          {tProjectStatus(project.status)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                    {t("licensesListTitle")}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {result.licenses.length === 0 && (
                      <li className="text-sm text-foreground/60">{t("noLicenses")}</li>
                    )}
                    {result.licenses.map((license) => (
                      <li
                        key={license.name}
                        className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2 text-sm"
                      >
                        <span>{license.name}</span>
                        <span className="text-xs font-medium text-brand-blue">
                          {tLicenseStatus(license.status)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href="/iniciar-sesion"
                className="mt-8 inline-block text-sm font-medium text-brand-blue hover:underline"
              >
                {t("goToLogin")} →
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
