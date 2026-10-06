// Edge Function: notify-email
//
// Invocada internamente (via trigger de Postgres + pg_net) cuando se crea un
// ticket de soporte o una cita. Nunca confia en el contenido del email/nombre
// enviado por el llamante: vuelve a leer la fila real desde la base de datos
// con la service role key, y envia el correo desde un remitente corporativo
// (Resend) en vez de una cuenta generica o personal.
//
// Requiere el secreto RESEND_API_KEY configurado en el proyecto de Supabase
// (Edge Functions > Secrets). Si no esta configurado, no falla: registra un
// aviso y responde 200 con sent:false, para no romper la creacion del ticket
// o la cita que disparo la notificacion.

import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_ADDRESS = Deno.env.get("NOTIFY_FROM_ADDRESS") ?? "NEXATIXS <notificaciones@nexatixs.com>";
const SUPPORT_INBOX = "soporte@nexatixs.com";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn("[notify-email] RESEND_API_KEY no configurado; se omite el envio.", { to, subject });
    return { sent: false, reason: "missing_api_key" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[notify-email] Resend respondio con error", response.status, body);
    return { sent: false, reason: "resend_error" };
  }

  return { sent: true };
}

function formatDateSantoDomingo(iso: string) {
  return new Date(iso).toLocaleString("es-DO", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Santo_Domingo",
  });
}

async function handleSupportTicket(id: string) {
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) {
    console.error("[notify-email] No se pudo leer el ticket de soporte", id, error);
    return { sent: false, reason: "not_found" };
  }

  const html = `
    <h2>Nuevo ticket de soporte: ${ticket.display_id}</h2>
    <p><strong>Nombre:</strong> ${ticket.contact_name}</p>
    <p><strong>Correo:</strong> ${ticket.contact_email}</p>
    <p><strong>Telefono:</strong> ${ticket.contact_phone ?? "No proporcionado"}</p>
    <p><strong>Asunto:</strong> ${ticket.subject}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${String(ticket.message).replace(/\n/g, "<br/>")}</p>
  `;

  return sendEmail(SUPPORT_INBOX, `[Soporte] ${ticket.display_id} — ${ticket.subject}`, html);
}

async function handleAppointment(id: string) {
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*, staff_users(full_name)")
    .eq("id", id)
    .single();

  if (error || !appointment) {
    console.error("[notify-email] No se pudo leer la cita", id, error);
    return { sent: false, reason: "not_found" };
  }

  const when = formatDateSantoDomingo(appointment.scheduled_at);
  const executiveName = appointment.staff_users?.full_name ?? "Un ejecutivo de NEXATIXS";
  const channelLabel = appointment.channel === "meet" ? "Google Meet" : "WhatsApp";

  const internalHtml = `
    <h2>Nueva cita agendada</h2>
    <p><strong>Contacto:</strong> ${appointment.contact_name} (${appointment.contact_email})</p>
    <p><strong>Telefono:</strong> ${appointment.contact_phone ?? "No proporcionado"}</p>
    <p><strong>Ejecutivo asignado:</strong> ${executiveName}</p>
    <p><strong>Fecha y hora:</strong> ${when}</p>
    <p><strong>Canal:</strong> ${channelLabel}</p>
  `;

  const clientHtml = `
    <h2>Su cita con NEXATIXS esta confirmada</h2>
    <p>Hola ${appointment.contact_name},</p>
    <p>Su cita con <strong>${executiveName}</strong> quedo agendada para el <strong>${when}</strong> (hora de Republica Dominicana), via <strong>${channelLabel}</strong>.</p>
    <p>Recibira el enlace de acceso antes de la reunion. Si necesita reprogramar, responda este correo.</p>
    <p>— Equipo NEXATIXS</p>
  `;

  const [internalResult, clientResult] = await Promise.all([
    sendEmail(SUPPORT_INBOX, `[Cita] ${appointment.contact_name} — ${when}`, internalHtml),
    sendEmail(appointment.contact_email, "Confirmacion de su cita con NEXATIXS", clientHtml),
  ]);

  return { internalResult, clientResult };
}

async function handleContactMessage(id: string) {
  const { data: contactMessage, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !contactMessage) {
    console.error("[notify-email] No se pudo leer el mensaje de contacto", id, error);
    return { sent: false, reason: "not_found" };
  }

  const html = `
    <h2>Nuevo mensaje de contacto: ${contactMessage.display_id}</h2>
    <p><strong>Nombre:</strong> ${contactMessage.contact_name}</p>
    <p><strong>Empresa:</strong> ${contactMessage.company_name ?? "No proporcionada"}</p>
    <p><strong>Correo:</strong> ${contactMessage.contact_email}</p>
    <p><strong>Telefono:</strong> ${contactMessage.contact_phone ?? "No proporcionado"}</p>
    <p><strong>Asunto:</strong> ${contactMessage.subject}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${String(contactMessage.message).replace(/\n/g, "<br/>")}</p>
  `;

  return sendEmail(
    SUPPORT_INBOX,
    `[Contacto] ${contactMessage.display_id} — ${contactMessage.subject}`,
    html,
  );
}

async function handleStatusOtp(payload: { to?: string; code?: string; displayId?: string }) {
  const { to, code, displayId } = payload;

  if (!to || !code || !displayId) {
    return { sent: false, reason: "invalid_payload" };
  }

  const html = `
    <h2>Código de verificación — NEXATIXS</h2>
    <p>Recibimos una solicitud para consultar el estatus de <strong>${displayId}</strong>.</p>
    <p>Su código de verificación es:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
    <p>Este código vence en 5 minutos y solo puede usarse una vez. Si usted no solicitó esta consulta, ignore este correo.</p>
    <p>— Equipo NEXATIXS</p>
  `;

  return sendEmail(to, `Su código de verificación: ${code}`, html);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { type, id } = body;

    if (type === "status_otp") {
      // A diferencia de support_ticket/appointment, aqui no hay una fila que
      // releer: el codigo lo genera Postgres una sola vez (request_status_otp)
      // y solo persiste su hash — el valor en claro solo existe en este
      // request, para poder enviarlo por correo.
      const result = await handleStatusOtp(body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validTypes = ["support_ticket", "appointment", "contact_message"];
    if (!id || !validTypes.includes(type)) {
      return new Response(JSON.stringify({ error: "invalid_payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result =
      type === "support_ticket"
        ? await handleSupportTicket(id)
        : type === "appointment"
          ? await handleAppointment(id)
          : await handleContactMessage(id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[notify-email] Error inesperado", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
