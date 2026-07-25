-- Rate limiting real de login y verificacion de 2FA (PDF: "Login: 5 intentos
-- cada 15 minutos", "OTP: 5 intentos cada 30 minutos").
--
-- Por que no bastaba un chequeo desde el cliente antes de llamar a
-- supabase.auth.signInWithPassword()/mfa.challengeAndVerify(): un chequeo asi
-- es bypasseable trivialmente por cualquiera que llame a la API de Supabase
-- directo (la anon key es publica por diseno) — no protege nada real, es
-- solo teatro. La unica forma real de hacer cumplir el limite es que la
-- app NUNCA hable con Supabase Auth directo desde el navegador para estas
-- dos acciones: el login y la verificacion 2FA se mueven a rutas de servidor
-- (src/app/api/auth/login, src/app/api/auth/verify-2fa) que consultan este
-- limite ANTES de intentar la operacion real.
--
-- Limite honesto, no perfecto: esto protege el flujo que pasa por nuestra
-- propia app. No puede impedir que alguien le pegue directo a la API publica
-- de Supabase saltandose nuestro sitio por completo — eso depende del rate
-- limiting propio de la plataforma Supabase (configurable en su dashboard,
-- no en migraciones). Documentado tambien en la nota del Cerebro.

create table public.auth_rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('login', 'mfa_verify')),
  identifier text not null,
  ip text not null,
  created_at timestamptz not null default now()
);

create index auth_rate_limits_lookup_idx on public.auth_rate_limits (scope, identifier, ip, created_at desc);

alter table public.auth_rate_limits enable row level security;
-- Sin policies: solo accesible via las funciones SECURITY DEFINER de abajo.

create or replace function public.check_auth_rate_limit(
  p_scope text,
  p_identifier text,
  p_ip text,
  p_window_minutes int,
  p_max_attempts int
) returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select count(*) < p_max_attempts
  from public.auth_rate_limits
  where scope = p_scope
    and identifier = lower(p_identifier)
    and ip = p_ip
    and created_at > now() - make_interval(mins => p_window_minutes);
$$;

create or replace function public.record_auth_attempt(
  p_scope text,
  p_identifier text,
  p_ip text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.auth_rate_limits (scope, identifier, ip)
  values (p_scope, lower(p_identifier), p_ip);
end;
$$;

revoke all on function public.check_auth_rate_limit(text, text, text, int, int) from public, anon, authenticated;
grant execute on function public.check_auth_rate_limit(text, text, text, int, int) to service_role;

revoke all on function public.record_auth_attempt(text, text, text) from public, anon, authenticated;
grant execute on function public.record_auth_attempt(text, text, text) to service_role;
