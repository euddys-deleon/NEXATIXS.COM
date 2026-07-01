import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardTitle } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { ProspectStatusForm } from "@/components/admin/ProspectStatusForm";
import { ConvertToClientForm } from "@/components/admin/ConvertToClientForm";

export default async function AdminProspectoDetallePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Admin.prospects.detail");

  const { data: prospect } = await supabase.from("prospects").select("*").eq("id", id).single();

  if (!prospect) notFound();

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link
          href="/admin/prospectos"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          ← {t("backToAll")}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {prospect.display_id}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          {prospect.form_type} · {prospect.category}
        </p>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("contactInfo")}</CardTitle>
          <div className="mt-3 space-y-1 text-sm text-foreground/70">
            <p>{prospect.contact_name}</p>
            <p>
              {t("email")}: {prospect.contact_email}
            </p>
            {prospect.contact_phone && (
              <p>
                {t("phone")}: {prospect.contact_phone}
              </p>
            )}
          </div>
        </Card>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("formData")}</CardTitle>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-foreground/5 p-4 text-xs text-foreground/70">
            {JSON.stringify(prospect.payload, null, 2)}
          </pre>
        </Card>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("statusTitle")}</CardTitle>
          <div className="mt-4">
            <ProspectStatusForm
              prospectId={prospect.id}
              initialStatus={prospect.status}
              initialPhase={prospect.pipeline_phase}
            />
          </div>
        </Card>

        <Card className="mt-6 bg-background">
          <CardTitle>{t("convertTitle")}</CardTitle>
          <div className="mt-4">
            {prospect.status === "cliente_activo" ? (
              <p className="text-sm text-foreground/60">{t("alreadyClient")}</p>
            ) : (
              <ConvertToClientForm
                prospectId={prospect.id}
                defaultEmail={prospect.contact_email}
                defaultName={prospect.contact_name}
              />
            )}
          </div>
        </Card>
      </Container>
    </Section>
  );
}
