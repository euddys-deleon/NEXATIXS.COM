import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(200),
});

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

function logAuthEvent(
  admin: ReturnType<typeof createAdminClient>,
  args: { actorId: string | null; email: string; event: string; ip: string; userAgent: string },
) {
  // Fire-and-forget: a logging failure must never block or crash the actual
  // auth flow.
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

// The actual sign-in MUST happen server-side, not in the browser: this is
// what makes the rate limit below real instead of a client-side check an
// attacker can just skip by calling Supabase Auth directly with the (public)
// anon key. See supabase/migrations/0026_auth_rate_limiting.sql.
export async function POST(request: NextRequest) {
  // Any unexpected throw (e.g. missing env config) must still come back as
  // JSON — the client always calls response.json() on the result, and a bare
  // HTML/empty error page there is an unhandled rejection, not a shown error.
  try {
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const ip = getClientIp(request);
    const admin = createAdminClient();

    const { data: allowed } = await admin.rpc("check_auth_rate_limit", {
      p_scope: "login",
      p_identifier: email,
      p_ip: ip,
      p_window_minutes: 15,
      p_max_attempts: 5,
    });

    if (!allowed) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      await admin.rpc("record_auth_attempt", { p_scope: "login", p_identifier: email, p_ip: ip });
      logAuthEvent(admin, { actorId: null, email, event: "login_failure", ip, userAgent });
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    logAuthEvent(admin, { actorId: data.user.id, email, event: "login_success", ip, userAgent });

    // The browser's Supabase client instance never saw this sign-in happen
    // (it ran against a separate server-side client) and won't know about
    // the new session until a fresh page load re-reads the cookies this
    // response sets. So resolveHomePath()'s client-side
    // supabase.auth.getUser() can't be trusted right after this call —
    // resolve the destination here instead, where the session is actually
    // known.
    const { data: staffUser } = await supabase
      .from("staff_users")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const destination = staffUser
      ? staffUser.role === "super_admin"
        ? "/superadmin"
        : "/admin"
      : "/portal/dashboard";

    return NextResponse.json({ ok: true, destination });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
