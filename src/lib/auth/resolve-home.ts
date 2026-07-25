import { supabase } from "@/lib/supabase/client";

/**
 * Resolves the correct landing route for the currently authenticated user:
 *   - staff with role "super_admin"                    -> /superadmin
 *   - staff with role "admin_operativo" or "soporte"    -> /admin
 *   - client user                                       -> /portal/dashboard
 *   - unauthenticated                                   -> /iniciar-sesion
 */
export async function resolveHomePath(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/iniciar-sesion";

  const { data: staffUser } = await supabase
    .from("staff_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (staffUser) return staffUser.role === "super_admin" ? "/superadmin" : "/admin";

  return "/portal/dashboard";
}

/**
 * Full-page (non-SPA) navigation into a server-gated area (/admin, /superadmin,
 * /portal). A soft `router.push` can outrace the Supabase auth cookie write
 * that follows an auth mutation (password change, MFA verification), so the
 * gated layout's server-side session/AAL read sees stale data and bounces the
 * user back — producing a redirect loop. A hard navigation forces a brand-new
 * request that always carries whatever cookies are current at click time.
 */
export function hardNavigateTo(locale: string, path: string) {
  window.location.href = `/${locale}${path}`;
}
