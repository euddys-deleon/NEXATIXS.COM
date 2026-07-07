import { NextResponse, type NextRequest } from "next/server";
import { GoogleGenAI, Type, type Content, type FunctionDeclaration } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "create_ticket",
    description: "Crea un ticket de soporte tecnico real para el cliente autenticado.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING, description: "Titulo breve del problema" },
        description: { type: Type.STRING, description: "Descripcion detallada del problema" },
        category: {
          type: Type.STRING,
          description: "Categoria del ticket, ej: Soporte Tecnico, Facturacion, Licencias",
        },
        priority: { type: Type.STRING, enum: ["baja", "media", "alta", "urgente"] },
      },
      required: ["subject", "description"],
    },
  },
  {
    name: "request_license_upsell",
    description: "Solicita la ampliacion o adquisicion de una licencia/herramienta para el cliente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        item_name: { type: Type.STRING, description: "Nombre de la licencia o herramienta solicitada" },
        notes: { type: Type.STRING, description: "Detalles adicionales de la solicitud" },
      },
      required: ["item_name"],
    },
  },
];

const TOOLS = [{ functionDeclarations: FUNCTION_DECLARATIONS }];

async function executeFunctionCall(
  supabase: SupabaseClient<Database>,
  clientId: string,
  userId: string,
  name: string,
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (name === "create_ticket") {
    const subject = String(args.subject ?? "").slice(0, 200);
    const description = String(args.description ?? "").slice(0, 4000);
    if (!subject || !description) return { success: false, error: "missing_fields" };

    const { data, error } = await supabase
      .from("tickets")
      .insert({
        client_id: clientId,
        created_by: userId,
        category: typeof args.category === "string" ? args.category : "Soporte Técnico",
        priority: ["baja", "media", "alta", "urgente"].includes(String(args.priority))
          ? (args.priority as string)
          : "media",
        subject,
        description,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, ticket_id: data.id };
  }

  if (name === "request_license_upsell") {
    const itemName = String(args.item_name ?? "").slice(0, 200);
    if (!itemName) return { success: false, error: "missing_fields" };

    const { data, error } = await supabase
      .from("upsell_requests")
      .insert({
        client_id: clientId,
        requested_by: userId,
        item_name: itemName,
        description: typeof args.notes === "string" ? args.notes.slice(0, 2000) : null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, request_id: data.id };
  }

  return { success: false, error: "unknown_function" };
}

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
  const apiKey = process.env.GEMINI_API_KEY;
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

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `Eres el asistente virtual del Portal de Cliente de NEXATIXS. Responde de forma breve, profesional, y en el mismo idioma en el que te escriba el usuario. Solo tienes el contexto de la cuenta del cliente autenticado listado abajo; no inventes datos que no estén ahí. Si preguntan algo fuera de su cuenta o de los servicios de NEXATIXS, indica amablemente que no tienes esa información y sugiere contactar a soporte@nexatixs.com.\n\nPuedes crear tickets de soporte y solicitar ampliaciones de licencias usando las funciones disponibles cuando el cliente lo pida explícitamente. Antes de ejecutar una función, confirma con el cliente los datos clave (asunto/problema, o nombre de la licencia). Nunca ejecutes una acción sin que el cliente haya pedido esa acción concreta.\n\nContexto de la cuenta:\n${context}`;

  const contents: Content[] = (body.messages as ChatMessage[]).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { maxOutputTokens: 1024, systemInstruction, tools: TOOLS },
    });

    const functionCalls = response.functionCalls;
    if (!functionCalls || functionCalls.length === 0) {
      return NextResponse.json({ reply: response.text ?? "" });
    }

    const functionResults = await Promise.all(
      functionCalls.map(async (call) => ({
        name: call.name ?? "",
        response: await executeFunctionCall(
          supabase,
          clientUser.client_id,
          user.id,
          call.name ?? "",
          (call.args ?? {}) as Record<string, unknown>,
        ),
      })),
    );

    const modelTurn = response.candidates?.[0]?.content;
    const followupContents: Content[] = [
      ...contents,
      ...(modelTurn ? [modelTurn] : []),
      {
        role: "user",
        parts: functionResults.map((result) => ({
          functionResponse: { name: result.name, response: result.response },
        })),
      },
    ];

    const followup = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: followupContents,
      config: { maxOutputTokens: 1024, systemInstruction },
    });

    return NextResponse.json({ reply: followup.text ?? "" });
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
