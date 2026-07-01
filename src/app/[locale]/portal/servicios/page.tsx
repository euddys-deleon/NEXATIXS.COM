import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { servicePillars } from "@/lib/services-catalog";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardTitle } from "@/components/ui/Card";
import { UpsellRequestButton } from "@/components/portal/UpsellRequestButton";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-500/10 text-amber-600",
  aprobada: "bg-emerald-500/10 text-emerald-600",
  rechazada: "bg-red-500/10 text-red-600",
};

export default async function PortalUpsellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user, clientUser, supabase } = await getPortalContext();

  if (!user || !clientUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Portal.upsell");
  const tPillars = await getTranslations("Services.pillars");

  const [{ data: catalog }, { data: myRequests }] = await Promise.all([
    supabase
      .from("services_catalog")
      .select("id, pillar_slug, item_name")
      .eq("is_upsell_eligible", true)
      .order("pillar_slug"),
    supabase
      .from("upsell_requests")
      .select("id, item_name, status, created_at")
      .eq("client_id", clientUser.client_id)
      .order("created_at", { ascending: false }),
  ]);

  const catalogByPillar = new Map<string, { id: string; item_name: string }[]>();
  for (const item of catalog ?? []) {
    const list = catalogByPillar.get(item.pillar_slug) ?? [];
    list.push(item);
    catalogByPillar.set(item.pillar_slug, list);
  }

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicePillars.map((pillar) => {
            const Icon = pillar.icon;
            const items = catalogByPillar.get(pillar.slug) ?? [];
            if (items.length === 0) return null;
            return (
              <Card key={pillar.slug} className="bg-background">
                <Icon className="text-brand-blue" size={22} />
                <CardTitle className="mt-3">{tPillars(`${pillar.slug}.title`)}</CardTitle>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-foreground/80">{item.item_name}</span>
                      <UpsellRequestButton
                        clientId={clientUser.client_id}
                        requestedBy={user.id}
                        itemName={item.item_name}
                      />
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {t("myRequestsTitle")}
          </h2>
          <Card className="mt-4 bg-background !p-0">
            {!myRequests || myRequests.length === 0 ? (
              <p className="p-6 text-sm text-foreground/50">{t("noRequests")}</p>
            ) : (
              <ul>
                {myRequests.map((request) => (
                  <li
                    key={request.id}
                    className="flex items-center justify-between gap-4 border-b border-foreground/5 px-5 py-4 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{request.item_name}</p>
                      <p className="text-xs text-foreground/50">
                        {new Date(request.created_at).toLocaleDateString(
                          locale === "en" ? "en-US" : "es-DO",
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                        statusStyles[request.status],
                      )}
                    >
                      {t(`statusLabels.${request.status}`)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </Container>
    </Section>
  );
}
