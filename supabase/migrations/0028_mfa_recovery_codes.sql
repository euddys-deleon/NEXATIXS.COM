-- Codigos de recuperacion para 2FA: permiten recuperar acceso a una cuenta
-- cuando el usuario pierde su dispositivo autenticador, sin crear un atajo
-- que baje el nivel de seguridad real de la cuenta.
--
-- Diseno deliberado: un codigo de recuperacion NUNCA eleva la sesion a aal2
-- por si mismo (esa elevacion solo la puede hacer el propio mecanismo de MFA
-- de Supabase via challengeAndVerify() contra un factor TOTP real). Lo unico
-- que hace un codigo valido es autorizar desenrolar el/los factores TOTP
-- actuales, forzando al usuario a registrar un autenticador nuevo (flujo real
-- de configurar-2fa, con su propio QR y su propia verificacion). Esto evita
-- que el mecanismo de recuperacion se convierta el mismo en una puerta
-- trasera para saltarse el 2FA.
--
-- Los codigos se guardan solo como hash (sha256): el valor en claro solo
-- existe en la respuesta de generate_recovery_codes(), una vez, igual que ya
-- se hace con el secreto TOTP (Supabase tampoco lo vuelve a exponer).

create table public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index mfa_recovery_codes_user_idx on public.mfa_recovery_codes (user_id, used_at);

alter table public.mfa_recovery_codes enable row level security;
-- Sin policies: solo accesible via las funciones SECURITY DEFINER de abajo.
-- Ni siquiera el propio usuario puede hacer select directo sobre sus hashes.

-- auth_audit_log.event tenia un check constraint cerrado a los eventos de la
-- migracion 0027; se amplia para los tres eventos nuevos de este flujo.
alter table public.auth_audit_log drop constraint auth_audit_log_event_check;
alter table public.auth_audit_log add constraint auth_audit_log_event_check
  check (event in (
    'login_success', 'login_failure',
    'mfa_verify_success', 'mfa_verify_failure',
    'logout', 'revoke_all_sessions',
    'recovery_codes_generated', 'recovery_code_used', 'recovery_code_failed'
  ));

-- auth_rate_limits.scope (migracion 0026) tampoco conocia este scope nuevo.
alter table public.auth_rate_limits drop constraint auth_rate_limits_scope_check;
alter table public.auth_rate_limits add constraint auth_rate_limits_scope_check
  check (scope in ('login', 'mfa_verify', 'recovery_code'));

-- ---------------------------------------------------------------------------
-- 1) Generar códigos: invalida cualquier set sin usar previo y crea 8 nuevos.
--    Callable directo por el usuario autenticado (como clear_must_change_
--    password()) — solo actua sobre auth.uid(), nunca sobre otro usuario.
-- ---------------------------------------------------------------------------

create or replace function public.generate_recovery_codes()
returns text[]
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_codes text[] := array[]::text[];
  v_code text;
  -- Sin 0/O/1/I para evitar confusion visual al transcribir a mano.
  v_alphabet text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_bytes bytea;
  v_chars text;
  i int;
  j int;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  delete from public.mfa_recovery_codes where user_id = v_user_id and used_at is null;

  for i in 1..8 loop
    v_bytes := extensions.gen_random_bytes(10);
    v_chars := '';
    for j in 1..10 loop
      v_chars := v_chars || substr(v_alphabet, (get_byte(v_bytes, j - 1) % length(v_alphabet)) + 1, 1);
    end loop;
    v_code := substr(v_chars, 1, 5) || '-' || substr(v_chars, 6, 5);
    v_codes := array_append(v_codes, v_code);

    insert into public.mfa_recovery_codes (user_id, code_hash)
    values (v_user_id, encode(extensions.digest(v_code, 'sha256'), 'hex'));
  end loop;

  insert into public.auth_audit_log (actor_id, email, event)
  values (v_user_id, v_email, 'recovery_codes_generated');

  return v_codes;
end;
$$;

revoke all on function public.generate_recovery_codes() from public, anon;
grant execute on function public.generate_recovery_codes() to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Canjear un código: rate limit real (5 intentos / 30 min por usuario,
--    igual que mfa_verify) + auditoria, dentro de la propia funcion — sigue
--    protegido aunque se llame directo con la anon key, a diferencia del
--    patron de login/verify-2fa que dependia de pasar por nuestra ruta de
--    servidor.
-- ---------------------------------------------------------------------------

create or replace function public.redeem_recovery_code(
  p_code text,
  p_ip text,
  p_user_agent text
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_hash text;
  v_allowed boolean;
  v_match_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  select public.check_auth_rate_limit('recovery_code', v_user_id::text, p_ip, 30, 5) into v_allowed;
  if not v_allowed then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  v_hash := encode(extensions.digest(upper(trim(p_code)), 'sha256'), 'hex');

  select id into v_match_id
  from public.mfa_recovery_codes
  where user_id = v_user_id and code_hash = v_hash and used_at is null
  limit 1;

  if v_match_id is null then
    perform public.record_auth_attempt('recovery_code', v_user_id::text, p_ip);
    insert into public.auth_audit_log (actor_id, email, event, ip, user_agent)
    values (v_user_id, v_email, 'recovery_code_failed', p_ip, p_user_agent);
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  update public.mfa_recovery_codes set used_at = now() where id = v_match_id;

  insert into public.auth_audit_log (actor_id, email, event, ip, user_agent)
  values (v_user_id, v_email, 'recovery_code_used', p_ip, p_user_agent);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.redeem_recovery_code(text, text, text) from public, anon;
grant execute on function public.redeem_recovery_code(text, text, text) to authenticated;
