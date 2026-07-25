-- Seguridad de sesiones (PDF): "Registrar: Login, Logout..." y "Revocacion:
-- Cerrar todas las sesiones desde panel".
--
-- public.audit_log (0012) solo se dispara via trigger en INSERT/UPDATE/DELETE
-- de tablas — nunca en eventos de autenticacion, porque no hay ninguna tabla
-- que cambie en un login/logout (Supabase Auth vive en el schema auth, fuera
-- de nuestros triggers). Se necesita una tabla y un punto de registro
-- explicito, invocado desde las rutas de servidor de auth.
--
-- Alcance de esta migracion: la captura de eventos + la accion de revocar
-- todas las sesiones. NO incluye una pantalla nueva en el admin para verlos
-- (la tabla + policy de lectura para staff ya quedan listas para que
-- /admin/auditoria — u otra vista — la consuma despues; construir esa UI es
-- trabajo aparte, no se improvisa aqui).

create table public.auth_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  email text,
  event text not null check (event in (
    'login_success', 'login_failure',
    'mfa_verify_success', 'mfa_verify_failure',
    'logout', 'revoke_all_sessions'
  )),
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index auth_audit_log_actor_idx on public.auth_audit_log (actor_id, created_at desc);

alter table public.auth_audit_log enable row level security;

create policy "staff_select_auth_audit_log" on public.auth_audit_log
  for select using (public.is_staff());

create or replace function public.log_auth_event(
  p_actor_id uuid,
  p_email text,
  p_event text,
  p_ip text,
  p_user_agent text
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.auth_audit_log (actor_id, email, event, ip, user_agent)
  values (p_actor_id, p_email, p_event, p_ip, p_user_agent);
$$;

revoke all on function public.log_auth_event(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.log_auth_event(uuid, text, text, text, text) to service_role;
