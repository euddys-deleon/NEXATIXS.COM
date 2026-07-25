import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  displayId: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(255),
});

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("request_status_otp", {
    p_display_id: parsed.data.displayId,
    p_email: parsed.data.email,
    p_ip: ip,
    p_user_agent: userAgent,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const result = data as {
    ok: boolean;
    rateLimited: boolean;
    shouldEmail: boolean;
    email: string | null;
    otp: string | null;
  };

  if (result.shouldEmail && result.email && result.otp) {
    // Fire-and-forget: no le decimos al cliente si el envío falló — la
    // respuesta pública es idéntica exista o no la solicitud (anti-enumeración).
    admin.functions
      .invoke("notify-email", {
        body: {
          type: "status_otp",
          to: result.email,
          code: result.otp,
          displayId: parsed.data.displayId.trim().toUpperCase(),
        },
      })
      .catch(() => {});
  }

  // Nunca se revela shouldEmail/email/otp al navegador — misma respuesta pública
  // sin importar si el ID/correo coincidían, exista rate limit aparte.
  return NextResponse.json({ ok: true, rateLimited: result.rateLimited });
}
