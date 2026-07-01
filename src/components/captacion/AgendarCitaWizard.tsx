"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { generateProspectPdf } from "@/lib/pdf/generate-prospect-pdf";
import {
  categoryToFormType,
  type F1Values,
  type F2Values,
  type F3Values,
  type ProspectCategory,
} from "@/lib/validations/prospect";
import { CategoryStep, type CategoryChoice } from "./CategoryStep";
import { CompanySizeStep, type CompanySize } from "./CompanySizeStep";
import { OrgPathStep, type OrgPath } from "./OrgPathStep";
import { FormF1 } from "./FormF1";
import { FormF2 } from "./FormF2";
import { FormF3 } from "./FormF3";
import { SuccessStep } from "./SuccessStep";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

type Step = "category" | "company-size" | "org-path" | "form" | "success";
type PdfField = { label: string; value: string };
type SubmitResult = {
  displayId: string;
  fields: PdfField[];
  formTypeLabel: string;
  categoryLabel: string;
};

export function AgendarCitaWizard() {
  const locale = useLocale();
  const t = useTranslations("Captacion");
  const tCategoryStep = useTranslations("Captacion.categoryStep");
  const tCompanySizeStep = useTranslations("Captacion.companySizeStep");
  const tOrgPathStep = useTranslations("Captacion.orgPathStep");
  const tf1 = useTranslations("Captacion.f1");
  const tf2 = useTranslations("Captacion.f2");
  const tf3 = useTranslations("Captacion.f3");

  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<CategoryChoice | null>(null);
  const [resolved, setResolved] = useState<ProspectCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  function categoryLabel(cat: CategoryChoice, res: ProspectCategory): string {
    if (cat === "empresa") {
      const sizeKey =
        res === "empresa_grande" ? "grande" : res === "empresa_mediana" ? "mediana" : "pequena";
      return `${tCategoryStep("empresa.title")} — ${tCompanySizeStep(`${sizeKey}.title`)}`;
    }
    if (cat === "organizacion") {
      const pathKey = res === "organizacion_analisis_profundo" ? "analisisProfundo" : "consultaRapida";
      return `${tCategoryStep("organizacion.title")} — ${tOrgPathStep(`${pathKey}.title`)}`;
    }
    return tCategoryStep("personaFisica.title");
  }

  function handleCategorySelect(choice: CategoryChoice) {
    setCategory(choice);
    if (choice === "empresa") setStep("company-size");
    else if (choice === "organizacion") setStep("org-path");
    else {
      setResolved("persona_fisica");
      setStep("form");
    }
  }

  function handleCompanySize(size: CompanySize) {
    const map: Record<CompanySize, ProspectCategory> = {
      grande: "empresa_grande",
      mediana: "empresa_mediana",
      pequena: "empresa_pequena",
    };
    setResolved(map[size]);
    setStep("form");
  }

  function handleOrgPath(path: OrgPath) {
    const map: Record<OrgPath, ProspectCategory> = {
      analisis_profundo: "organizacion_analisis_profundo",
      consulta_rapida: "organizacion_consulta_rapida",
    };
    setResolved(map[path]);
    setStep("form");
  }

  function handleBackFromForm() {
    if (category === "empresa") setStep("company-size");
    else if (category === "organizacion") setStep("org-path");
    else setStep("category");
  }

  function handleBackToCategory() {
    setCategory(null);
    setStep("category");
  }

  async function submitProspect(
    formType: "F1" | "F2" | "F3",
    categoryTag: ProspectCategory,
    payload: Json,
    contact: { name: string; email: string; phone: string },
    fields: PdfField[],
    formTypeLabel: string,
    catLabel: string,
  ) {
    setSubmitting(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("create_prospect", {
      p_form_type: formType,
      p_category: categoryTag,
      p_contact_name: contact.name,
      p_contact_email: contact.email,
      p_contact_phone: contact.phone,
      p_payload: payload,
    });

    setSubmitting(false);

    if (rpcError || !data) {
      setError(t("errorGeneric"));
      return;
    }

    setResult({
      displayId: data as string,
      fields,
      formTypeLabel,
      categoryLabel: catLabel,
    });
    setStep("success");
  }

  async function handleSubmitF1(values: F1Values) {
    if (!resolved || !category) return;
    const employeeOptions = tf1.raw("employeeOptions") as Record<string, string>;
    const timelineOptions = tf1.raw("timelineOptions") as Record<string, string>;
    const fields: PdfField[] = [
      { label: tf1("razonSocial"), value: values.razonSocial },
      { label: tf1("rnc"), value: values.rnc },
      { label: tf1("sector"), value: values.sector },
      { label: tf1("employeeCount"), value: employeeOptions[values.employeeCount] },
      { label: tf1("contactName"), value: values.contactName },
      { label: tf1("contactRole"), value: values.contactRole },
      { label: tf1("email"), value: values.email },
      { label: tf1("phone"), value: values.phone },
      { label: tf1("currentInfra"), value: values.currentInfra },
      { label: tf1("mainObjective"), value: values.mainObjective },
      { label: tf1("timeline"), value: timelineOptions[values.timeline] },
    ];
    await submitProspect(
      "F1",
      resolved,
      values,
      { name: values.contactName, email: values.email, phone: values.phone },
      fields,
      tf1("title"),
      categoryLabel(category, resolved),
    );
  }

  async function handleSubmitF2(values: F2Values) {
    if (!resolved || !category) return;
    const fields: PdfField[] = [
      { label: tf2("businessName"), value: values.businessName },
      { label: tf2("requesterName"), value: values.requesterName },
      { label: tf2("email"), value: values.email },
      { label: tf2("phone"), value: values.phone },
      { label: tf2("businessActivity"), value: values.businessActivity },
      { label: tf2("helpArea"), value: values.helpArea },
      { label: tf2("website"), value: values.website ?? "" },
    ];
    await submitProspect(
      "F2",
      resolved,
      values,
      { name: values.requesterName, email: values.email, phone: values.phone },
      fields,
      tf2("title"),
      categoryLabel(category, resolved),
    );
  }

  async function handleSubmitF3(values: F3Values) {
    if (!resolved || !category) return;
    const fields: PdfField[] = [
      { label: tf3("fullName"), value: values.fullName },
      { label: tf3("cedula"), value: values.cedula ?? "" },
      { label: tf3("email"), value: values.email },
      { label: tf3("phone"), value: values.phone },
      { label: tf3("occupation"), value: values.occupation },
      { label: tf3("reason"), value: values.reason },
    ];
    await submitProspect(
      "F3",
      resolved,
      values,
      { name: values.fullName, email: values.email, phone: values.phone },
      fields,
      tf3("title"),
      categoryLabel(category, resolved),
    );
  }

  function handleDownloadPdf() {
    if (!result) return;
    generateProspectPdf({
      displayId: result.displayId,
      formTypeLabel: result.formTypeLabel,
      categoryLabel: result.categoryLabel,
      fields: result.fields,
      locale,
    });
  }

  const formType = resolved ? categoryToFormType[resolved] : null;

  return (
    <Section>
      <Container className="max-w-3xl">
        {error && (
          <p className="mb-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${resolved ?? "none"}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step === "category" && <CategoryStep onSelect={handleCategorySelect} />}
            {step === "company-size" && (
              <CompanySizeStep onSelect={handleCompanySize} onBack={handleBackToCategory} />
            )}
            {step === "org-path" && (
              <OrgPathStep onSelect={handleOrgPath} onBack={handleBackToCategory} />
            )}
            {step === "form" && formType === "F1" && (
              <FormF1 onBack={handleBackFromForm} onSubmit={handleSubmitF1} submitting={submitting} />
            )}
            {step === "form" && formType === "F2" && (
              <FormF2 onBack={handleBackFromForm} onSubmit={handleSubmitF2} submitting={submitting} />
            )}
            {step === "form" && formType === "F3" && (
              <FormF3 onBack={handleBackFromForm} onSubmit={handleSubmitF3} submitting={submitting} />
            )}
            {step === "success" && result && (
              <SuccessStep displayId={result.displayId} onDownloadPdf={handleDownloadPdf} />
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </Section>
  );
}
