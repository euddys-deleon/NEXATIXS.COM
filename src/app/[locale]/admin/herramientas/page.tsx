import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { AddToolForm } from "@/components/admin/AddToolForm";
import { ToolRow } from "@/components/admin/ToolRow";

export default async function AdminHerramientasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Admin.tools");

  const { data: tools } = await supabase
    .from("tools")
    .select("id, code, name, url, status, version")
    .order("name", { ascending: true });

  const allTools = tools ?? [];

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <Card className="mt-6">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
            {t("addTitle")}
          </h2>
          <div className="mt-4">
            <AddToolForm />
          </div>
        </Card>

        <div className="mt-8 space-y-3">
          {allTools.length === 0 ? (
            <p className="text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            allTools.map((tool) => <ToolRow key={tool.id} tool={tool} />)
          )}
        </div>
      </Container>
    </Section>
  );
}
