import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

// Self-service "sign out everywhere" (PDF: "Revocacion: Cerrar todas las
// sesiones desde panel"). admin.signOut() takes the JWT of the session to
// revoke, not a user id — verified against the installed
// @supabase/auth-js@2.110.7 types (GoTrueAdminApi.d.ts) rather than assumed
// from memory, since 'global' scope on that JWT revokes every session
// belonging to its owner, not just the current one.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.signOut(session.access_token, "global");

    if (error) {
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    admin
      .rpc("log_auth_event", {
        p_actor_id: session.user.id,
        p_email: session.user.email ?? null,
        p_event: "revoke_all_sessions",
        p_ip: ip,
        p_user_agent: userAgent,
      })
      .then(
        () => {},
        () => {},
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
