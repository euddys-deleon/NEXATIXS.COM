import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 20 &&
    value.every(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.length > 0 &&
        item.content.length <= 4000,
    )
  );
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: clientUser } = await supabase
    .from("client_users")
    .select("full_name, client_id")
    .eq("id", user.id)
    .single();

  if (!clientUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !isValidMessages(body.messages)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const [{ data: projects }, { data: licenses }, { data: tickets }] = await Promise.all([
    supabase
      .from("projects")
      .select("name, status, progress_percent")
      .eq("client_id", clientUser.client_id),
    supabase
      .from("licenses")
      .select("name, status, expires_at")
      .eq("client_id", clientUser.client_id),
    supabase
      .from("tickets")
      .select("subject, status, priority")
      .eq("client_id", clientUser.client_id),
  ]);

  const context = [
    `Cliente: ${clientUser.full_name}`,
    `Proyectos: ${JSON.stringify(projects ?? [])}`,
    `Licencias: ${JSON.stringify(licenses ?? [])}`,
    `Tickets: ${JSON.stringify(tickets ?? [])}`,
  ].join("\n");

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: `Eres el asistente virtual del Portal de Cliente de NEXATIXS. Responde de forma breve, profesional, y en el mismo idioma en el que te escriba el usuario. Solo tienes el contexto de la cuenta del cliente autenticado listado abajo; no inventes datos que no estén ahí. Si preguntan algo fuera de su cuenta o de los servicios de NEXATIXS, indica amablemente que no tienes esa información y sugiere contactar a soporte@nexatixs.com.\n\nContexto de la cuenta:\n${context}`,
      messages: body.messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");

    return NextResponse.json({ reply: textBlock?.type === "text" ? textBlock.text : "" });
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
