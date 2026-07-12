import { supabase } from "@/lib/supabase/client";

/**
 * Resolves the correct landing route for the currently authenticated user:
 *   - staff with role "admin"  -> /superadmin
 *   - staff with role "staff"  -> /admin
 *   - client user              -> /portal/dashboard
 *   - unauthenticated          -> /iniciar-sesion
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

  if (staffUser) return staffUser.role === "admin" ? "/superadmin" : "/admin";

  return "/portal/dashboard";
}
