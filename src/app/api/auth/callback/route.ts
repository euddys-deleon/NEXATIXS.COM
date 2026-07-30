import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { routing } from "@/i18n/routing";

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

function logAuthEvent(
  admin: ReturnType<typeof createAdminClient>,
  args: { actorId: string | null; email: string | null; event: string; ip: string; userAgent: string },
) {
  // Fire-and-forget: a logging failure must never block or crash the actual
  // auth flow. Same reasoning as src/app/api/auth/login/route.ts.
  admin
    .rpc("log_auth_event", {
      p_actor_id: args.actorId,
      p_email: args.email,
      p_event: args.event,
      p_ip: args.ip,
      p_user_agent: args.userAgent,
    })
    .then(
      () => {},
      () => {},
    );
}

function resolveLocale(raw: string | null): (typeof routing.locales)[number] {
  return (routing.locales as readonly string[]).includes(raw ?? "")
    ? (raw as (typeof routing.locales)[number])
    : routing.defaultLocale;
}

// Handles the redirect Supabase sends the browser back to after Google
// completes the OAuth handshake (see the signInWithOAuth call in
// iniciar-sesion/LoginForm.tsx). This route is under /api/ specifically so
// proxy.ts's next-intl middleware skips it (it isn't a locale-prefixed page)
// — the locale travels through as a query param instead and is applied to
// the final redirect target here.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const locale = resolveLocale(searchParams.get("locale"));

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/iniciar-sesion?error=oauth_error`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/${locale}/iniciar-sesion?error=oauth_error`);
  }

  const admin = createAdminClient();
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  // Google Sign-In here is a login method, not a signup flow: this app is
  // invite-only (accounts are provisioned by staff, see "Solicite una
  // evaluación" on the login page). Supabase will happily create a brand
  // new auth.users row for any Google account that completes the OAuth
  // handshake, so we must explicitly reject anyone who isn't already a
  // provisioned staff_users/client_users row — otherwise this becomes an
  // open self-service signup door, and downstream pages that assume a
  // client_users row always exists (get-portal-context.ts uses .single())
  // would break for them anyway.
  const { data: staffUser } = await supabase
    .from("staff_users")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  let destination: string;

  if (staffUser) {
    destination = staffUser.role === "super_admin" ? "/superadmin" : "/admin";
  } else {
    const { data: clientUser } = await supabase
      .from("client_users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!clientUser) {
      logAuthEvent(admin, {
        actorId: data.user.id,
        email: data.user.email ?? null,
        event: "oauth_login_rejected_no_account",
        ip,
        userAgent,
      });
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/${locale}/iniciar-sesion?error=no_account`);
    }

    destination = "/portal/dashboard";
  }

  logAuthEvent(admin, {
    actorId: data.user.id,
    email: data.user.email ?? null,
    event: "login_success",
    ip,
    userAgent,
  });

  return NextResponse.redirect(`${origin}/${locale}${destination}`);
}
