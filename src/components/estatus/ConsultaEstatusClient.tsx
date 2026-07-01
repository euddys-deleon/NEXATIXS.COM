"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
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

export function ConsultaEstatusClient() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Estatus.page");
  const tProjectStatus = useTranslations("Estatus.projectStatus");
  const tLicenseStatus = useTranslations("Estatus.licenseStatus");

  const [id, setId] = useState(searchParams.get("id") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResult | null>(null);

  async function lookup(displayId: string) {
    if (!displayId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: rpcError } = await supabase.rpc("get_prospect_status", {
      p_display_id: displayId.trim().toUpperCase(),
    });

    setLoading(false);

    if (rpcError) {
      setError(t("errorGeneric"));
      return;
    }

    setResult(data as StatusResult);
  }

  useEffect(() => {
    const initial = searchParams.get("id");
    if (initial) lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    lookup(id);
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

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              value={id}
              onChange={(event) => setId(event.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("title")}
            />
            <Button type="submit" disabled={loading}>
              {loading ? t("searching") : t("cta")}
            </Button>
          </form>

          {error && (
            <p className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {result && !result.found && (
            <p className="mt-8 rounded-xl border border-dashed border-foreground/20 p-6 text-center text-sm text-foreground/60">
              {t("notFound")}
            </p>
          )}

          {result && result.found && !result.isClient && (
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

          {result && result.found && result.isClient && (
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
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
                    {t("projectsListTitle")}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {result.projects.length === 0 && (
                      <li className="text-sm text-foreground/50">{t("noProjects")}</li>
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
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
                    {t("licensesListTitle")}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {result.licenses.length === 0 && (
                      <li className="text-sm text-foreground/50">{t("noLicenses")}</li>
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
