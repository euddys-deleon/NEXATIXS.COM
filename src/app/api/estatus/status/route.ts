import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  displayId: z.string().trim().min(1).max(40),
  token: z.string().trim().uuid(),
});

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("get_status_by_token", {
    p_display_id: parsed.data.displayId,
    p_token: parsed.data.token,
    p_ip: ip,
    p_user_agent: userAgent,
  });

  if (error) {
    return NextResponse.json({ found: false }, { status: 500 });
  }

  return NextResponse.json(data);
}
