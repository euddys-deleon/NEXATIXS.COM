import { createClient } from "@supabase/supabase-js";

// Cliente con la service role key: SOLO para uso en código de servidor (route
// handlers, nunca componentes cliente). Se usa para invocar las funciones
// SECURITY DEFINER de consulta-estatus (request_status_otp, verify_status_otp,
// get_status_by_token), a las que anon/authenticated no tienen grant de
// ejecución — deben pasar siempre por nuestras rutas de API, nunca directo
// desde el navegador.
//
// Sin el generic <Database>: el esquema generado no incluye estas funciones
// nuevas y no hay forma de regenerarlo sin acceso al proyecto de Supabase.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
