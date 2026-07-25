import { redirect } from "@/i18n/navigation";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { getSecurityGateRedirect } from "@/lib/auth/security-gate";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const gate = await getSecurityGateRedirect(supabase, staffUser.must_change_password);
  if (gate) {
    redirect({ href: gate, locale });
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader fullName={staffUser.full_name} role={staffUser.role} />
      <main className="flex flex-1 flex-col bg-background-subtle">{children}</main>
    </div>
  );
}
