-- Security Hardening (parte 1): endurece lo que el audit encontro concreto y
-- verificable en el codigo actual — el resto del Security Hardening Project
-- del PDF (rate limiting de login/2FA, deteccion de sesion sospechosa,
-- anti-DDoS/WAF) requiere infraestructura o cambios de arquitectura mas
-- grandes y queda documentado aparte, no se improvisa aqui.

-- 1) Enforcement real (no solo client-side) del tipo de archivo permitido en
--    el bucket de adjuntos. Antes solo tenia file_size_limit (15MB); ahora
--    tambien restringe el Content-Type declarado en el upload. Debe
--    mantenerse en sync con ALLOWED_MIME_TYPES en
--    src/lib/attachments/allowed-file-types.ts.
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv'
]
where id = 'attachments';

-- 2) Unica tabla sin RLS encontrada en el audit: _internal_config. Ya estaba
--    protegida por "revoke all ... from anon, authenticated" (grant-level,
--    no RLS), asi que esto es defense-in-depth, no un fix de un hueco
--    explotable — pero cierra la unica inconsistencia frente a las otras 21
--    tablas del esquema, que si tienen RLS habilitado.
alter table public._internal_config enable row level security;
