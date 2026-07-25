import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  factorId: z.string().trim().min(1),
  code: z.string().trim().regex(/^\d{6}$/),
});

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

function logAuthEvent(
  admin: ReturnType<typeof createAdminClient>,
  args: { actorId: string | null; email: string | null; event: string; ip: string; userAgent: string },
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

// Same reasoning as src/app/api/auth/login/route.ts: the actual
// mfa.challengeAndVerify call must happen server-side for the rate limit to
// mean anything.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const { factorId, code } = parsed.data;
    const ip = getClientIp(request);
    const admin = createAdminClient();

    const { data: allowed } = await admin.rpc("check_auth_rate_limit", {
      p_scope: "mfa_verify",
      p_identifier: user.id,
      p_ip: ip,
      p_window_minutes: 30,
      p_max_attempts: 5,
    });

    if (!allowed) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });

    if (error) {
      await admin.rpc("record_auth_attempt", {
        p_scope: "mfa_verify",
        p_identifier: user.id,
        p_ip: ip,
      });
      logAuthEvent(admin, {
        actorId: user.id,
        email: user.email ?? null,
        event: "mfa_verify_failure",
        ip,
        userAgent,
      });
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 });
    }

    logAuthEvent(admin, {
      actorId: user.id,
      email: user.email ?? null,
      event: "mfa_verify_success",
      ip,
      userAgent,
    });

    // Same reasoning as login/route.ts: resolve the destination server-side,
    // where the just-elevated aal2 session is actually known.
    const { data: staffUser } = await supabase
      .from("staff_users")
      .select("role")
      .eq("id", user.id)
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
