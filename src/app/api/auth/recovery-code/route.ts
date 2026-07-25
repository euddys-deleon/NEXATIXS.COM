import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  code: z.string().trim().min(1).max(20),
});

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

// Canjear un codigo de recuperacion tiene que pasar por aqui, con la service
// role key, porque Supabase exige AAL2 para desenrolar un factor TOTP ya
// *verificado* (auth-js: "insufficient_aal") — verificado contra la API real,
// no asumido. Un usuario que perdio su autenticador esta atascado en aal1
// por definicion, asi que la unica forma de desenrolar su factor viejo es la
// API de administrador (auth.admin.mfa.deleteFactor), que no tiene ese
// requisito por ser una accion administrativa, no de auto-servicio.
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

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    // El rate limit real vive dentro de la propia funcion SECURITY DEFINER
    // (redeem_recovery_code), no aqui — se llama con la sesion normal del
    // usuario, no con la service role key, para que auth.uid() resuelva
    // correctamente al usuario que esta canjeando su propio codigo.
    const { data, error: rpcError } = await supabase.rpc("redeem_recovery_code", {
      p_code: parsed.data.code,
      p_ip: ip,
      p_user_agent: userAgent,
    });

    const result = data as { ok: boolean; error?: string } | null;

    if (rpcError || !result?.ok) {
      return NextResponse.json(
        { ok: false, error: result?.error ?? "server_error" },
        { status: result?.error === "rate_limited" ? 429 : 401 },
      );
    }

    const admin = createAdminClient();
    const { data: factorsData } = await admin.auth.admin.mfa.listFactors({ userId: user.id });

    for (const factor of factorsData?.factors ?? []) {
      if (factor.factor_type === "totp") {
        await admin.auth.admin.mfa.deleteFactor({ id: factor.id, userId: user.id });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
