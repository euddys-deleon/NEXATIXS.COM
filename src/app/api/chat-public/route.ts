import { NextResponse, type NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 10 &&
    value.every(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.length > 0 &&
        item.content.length <= 1000,
    )
  );
}

const SYSTEM_INSTRUCTION = `Eres el asistente virtual público del sitio web de NEXATIXS, una empresa de tecnología en República Dominicana. Respondes en el mismo idioma en el que te escriba el visitante (español o inglés).

Información pública que conoces:
- Servicios (6 pilares): Desarrollo de software, Infraestructura TI, Automatización, Cloud, Ciberseguridad, Soporte Técnico.
- Producto propio: Mayfren CRM, una plataforma de gestión de TI y CRM desarrollada por NEXATIXS (mayfren.lat).
- Contacto: soporte@nexatixs.com, teléfono (829) 268-0004, horario lunes a viernes 8:00 a.m. a 6:00 p.m.
- Páginas del sitio: /servicios, /soluciones, /herramientas (Mayfren y futuras herramientas), /noticias (noticias de tecnología), /soporte (contacto), /nosotros (equipo), /agendar-cita (solicitar una asesoría/cotización), /consulta-estatus (consultar el avance de una solicitud existente con un ID tipo NXT-2026-00042).

Reglas estrictas:
- NO tienes acceso a ninguna cuenta, cliente, factura, ticket ni dato privado. Si preguntan por información de una cuenta específica, responde que deben iniciar sesión en el Portal de Clientes.
- NO inventes precios exactos, plazos ni compromisos contractuales. Para cotizaciones, dirige siempre a /agendar-cita.
- Si el visitante quiere navegar a una sección, indícale el nombre de la página correspondiente de forma natural (ej. "puedes verlo en la sección de Servicios").
- Sé breve, profesional y útil. No respondas preguntas que no tengan relación con NEXATIXS o sus servicios.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !isValidMessages(body.messages)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: (body.messages as ChatMessage[]).map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      config: { maxOutputTokens: 512, systemInstruction: SYSTEM_INSTRUCTION },
    });

    return NextResponse.json({ reply: response.text ?? "" });
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
