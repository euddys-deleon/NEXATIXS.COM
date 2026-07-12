import { redirect } from "@/i18n/navigation";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
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

  if (staffUser.must_change_password) {
    redirect({ href: "/cambiar-password", locale });
    return null;
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal1") {
    redirect({ href: "/configurar-2fa", locale });
    return null;
  }
  if (aal && aal.currentLevel !== "aal2") {
    redirect({ href: "/verificar-2fa", locale });
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader fullName={staffUser.full_name} />
      <main className="flex flex-1 flex-col bg-background-subtle">{children}</main>
    </div>
  );
}
