import { redirect } from "@/i18n/navigation";
import { getPortalContext } from "@/lib/supabase/get-portal-context";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ChatWidget } from "@/components/portal/ChatWidget";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user, clientUser, supabase } = await getPortalContext();

  if (!user || !clientUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const { data: client } = await supabase
    .from("clients")
    .select("prospect_id")
    .eq("id", clientUser.client_id)
    .single();

  let displayId = "—";
  if (client?.prospect_id) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("display_id")
      .eq("id", client.prospect_id)
      .single();
    if (prospect) displayId = prospect.display_id;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PortalHeader displayId={displayId} fullName={clientUser.full_name} />
      <main className="flex flex-1 flex-col bg-background-subtle">{children}</main>
      <ChatWidget />
    </div>
  );
}
