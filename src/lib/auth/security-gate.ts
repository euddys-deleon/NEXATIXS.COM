import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Enforces the account-security flow required before entering any protected
 * area (client portal, admin, superadmin):
 *   1. Forced password change (temporary/provisioning password still in use).
 *   2. TOTP 2FA enrollment.
 *   3. TOTP 2FA verification for the current session.
 *
 * Returns the path the user must be sent to, or null when all requirements
 * are satisfied.
 */
export async function getSecurityGateRedirect(
  supabase: SupabaseClient<Database>,
  mustChangePassword: boolean,
): Promise<string | null> {
  if (mustChangePassword) return "/cambiar-password";

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!aal) return null;

  // No TOTP factor enrolled yet.
  if (aal.nextLevel === "aal1") return "/configurar-2fa";

  // A factor exists but this session hasn't been elevated to aal2 yet.
  if (aal.currentLevel !== "aal2") return "/verificar-2fa";

  return null;
}
