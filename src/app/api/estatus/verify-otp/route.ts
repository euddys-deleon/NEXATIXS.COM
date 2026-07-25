import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  displayId: z.string().trim().min(1).max(40),
  otp: z.string().trim().regex(/^\d{6}$/),
});

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, locked: false }, { status: 400 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("verify_status_otp", {
    p_display_id: parsed.data.displayId,
    p_otp: parsed.data.otp,
    p_ip: ip,
    p_user_agent: userAgent,
  });

  if (error) {
    return NextResponse.json({ ok: false, locked: false }, { status: 500 });
  }

  return NextResponse.json(data as { ok: boolean; locked: boolean; token?: string });
}
