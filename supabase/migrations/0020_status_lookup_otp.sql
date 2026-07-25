-- Cierra el IDOR de "consulta de estatus": hasta ahora get_prospect_status(display_id)
-- estaba otorgado a anon/authenticated y devolvia nombre de empresa, proyectos y
-- licencias con solo conocer o adivinar un ID tipo NXT-2026-00042. Este archivo:
--   1. Crea el flujo de verificacion por correo + OTP (6 digitos, 5 min, un solo uso).
--   2. Agrega rate limiting (5 solicitudes / 15 min por IP) y bloqueo (5 OTP
--      incorrectos / 30 min) para consulta_otp.
--   3. Agrega un log de auditoria dedicado (fecha, hora, ip, user-agent, id, resultado).
--   4. Revoca el grant publico de get_prospect_status y solo permite leer el estatus
--      real a traves de un token de sesion verificada de corta duracion.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.status_otp_requests (
  id uuid primary key default gen_random_uuid(),
  display_id text not null,
  email text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts int not null default 0,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index status_otp_requests_display_id_idx on public.status_otp_requests (display_id, created_at desc);
create index status_otp_requests_ip_idx on public.status_otp_requests (ip, created_at desc);

alter table public.status_otp_requests enable row level security;
-- Sin policies: la tabla solo se lee/escribe desde funciones SECURITY DEFINER.
-- anon/authenticated no reciben ningun grant directo sobre ella.

create table public.status_verified_sessions (
  token uuid primary key default gen_random_uuid(),
  display_id text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.status_verified_sessions enable row level security;

create table public.status_lookup_audit (
  id uuid primary key default gen_random_uuid(),
  display_id text,
  email text,
  ip text,
  user_agent text,
  action text not null check (action in (
    'otp_requested', 'otp_request_blocked', 'otp_verified', 'otp_failed', 'otp_locked', 'status_viewed'
  )),
  detail text,
  created_at timestamptz not null default now()
);

alter table public.status_lookup_audit enable row level security;

create policy "staff_select_status_lookup_audit" on public.status_lookup_audit
  for select using (public.is_staff());

-- ---------------------------------------------------------------------------
-- 1) Solicitar OTP: valida ID + correo, nunca revela cual de los dos fallo.
-- ---------------------------------------------------------------------------

create or replace function public.request_status_otp(
  p_display_id text,
  p_email text,
  p_ip text,
  p_user_agent text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_id text := upper(trim(p_display_id));
  v_email text := lower(trim(p_email));
  v_recent_from_ip int;
  v_prospect record;
  v_client record;
  v_target_email text;
  v_matched boolean := false;
  v_otp text;
  v_otp_hash text;
begin
  select count(*) into v_recent_from_ip
  from public.status_otp_requests
  where ip = p_ip and created_at > now() - interval '15 minutes';

  if v_recent_from_ip >= 5 then
    insert into public.status_lookup_audit (display_id, email, ip, user_agent, action, detail)
    values (v_display_id, v_email, p_ip, p_user_agent, 'otp_request_blocked', 'rate_limited');
    return jsonb_build_object('ok', true, 'rateLimited', true);
  end if;

  select id, contact_email, status into v_prospect
  from public.prospects
  where display_id = v_display_id;

  if found then
    if v_prospect.status = 'cliente_activo' then
      select c.id into v_client from public.clients c where c.prospect_id = v_prospect.id;

      if v_client.id is not null then
        select lower(u.email) into v_target_email
        from public.client_users cu
        join auth.users u on u.id = cu.id
        where cu.client_id = v_client.id
        order by cu.created_at asc
        limit 1;

        if v_target_email is null then
          select lower(email) into v_target_email
          from public.client_contacts
          where client_id = v_client.id and email is not null
          order by created_at asc
          limit 1;
        end if;
      end if;
    else
      v_target_email := lower(v_prospect.contact_email);
    end if;

    if v_target_email is not null and v_target_email = v_email then
      v_matched := true;
    end if;
  end if;

  -- Genera y guarda el OTP solo si hubo match real; de lo contrario seguimos el
  -- mismo camino de codigo pero sin persistir nada ni enviar correo, para que la
  -- respuesta al front sea identica en ambos casos (anti-enumeracion).
  if v_matched then
    v_otp := lpad(floor(random() * 1000000)::text, 6, '0');
    v_otp_hash := encode(digest(v_otp || v_display_id, 'sha256'), 'hex');

    insert into public.status_otp_requests (display_id, email, otp_hash, expires_at, ip, user_agent)
    values (v_display_id, v_email, v_otp_hash, now() + interval '5 minutes', p_ip, p_user_agent);
  end if;

  insert into public.status_lookup_audit (display_id, email, ip, user_agent, action, detail)
  values (v_display_id, v_email, p_ip, p_user_agent, 'otp_requested', case when v_matched then 'match' else 'no_match' end);

  -- 'otp'/'email' solo viajan de vuelta a nuestra propia ruta de servidor (que
  -- llama con la service role key) para disparar el correo; nunca deben
  -- reenviarse tal cual al navegador.
  return jsonb_build_object(
    'ok', true,
    'rateLimited', false,
    'shouldEmail', v_matched,
    'email', case when v_matched then v_target_email else null end,
    'otp', case when v_matched then v_otp else null end
  );
end;
$$;

revoke all on function public.request_status_otp(text, text, text, text) from public, anon, authenticated;
grant execute on function public.request_status_otp(text, text, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 2) Validar OTP: max 5 intentos fallidos, luego bloqueo de 30 min.
-- ---------------------------------------------------------------------------

create or replace function public.verify_status_otp(
  p_display_id text,
  p_otp text,
  p_ip text,
  p_user_agent text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_id text := upper(trim(p_display_id));
  v_recent_failures int;
  v_request record;
  v_otp_hash text;
  v_token uuid;
begin
  select count(*) into v_recent_failures
  from public.status_lookup_audit
  where display_id = v_display_id
    and action = 'otp_failed'
    and created_at > now() - interval '30 minutes';

  if v_recent_failures >= 5 then
    insert into public.status_lookup_audit (display_id, ip, user_agent, action, detail)
    values (v_display_id, p_ip, p_user_agent, 'otp_locked', 'too_many_failures');
    return jsonb_build_object('ok', false, 'locked', true);
  end if;

  select * into v_request
  from public.status_otp_requests
  where display_id = v_display_id
    and consumed_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if not found then
    insert into public.status_lookup_audit (display_id, ip, user_agent, action, detail)
    values (v_display_id, p_ip, p_user_agent, 'otp_failed', 'no_active_otp');
    return jsonb_build_object('ok', false, 'locked', false);
  end if;

  v_otp_hash := encode(digest(trim(p_otp) || v_display_id, 'sha256'), 'hex');

  if v_otp_hash <> v_request.otp_hash then
    update public.status_otp_requests set attempts = attempts + 1 where id = v_request.id;
    insert into public.status_lookup_audit (display_id, ip, user_agent, action, detail)
    values (v_display_id, p_ip, p_user_agent, 'otp_failed', 'wrong_code');
    return jsonb_build_object('ok', false, 'locked', false);
  end if;

  update public.status_otp_requests set consumed_at = now() where id = v_request.id;

  v_token := gen_random_uuid();
  insert into public.status_verified_sessions (token, display_id, expires_at)
  values (v_token, v_display_id, now() + interval '10 minutes');

  insert into public.status_lookup_audit (display_id, ip, user_agent, action, detail)
  values (v_display_id, p_ip, p_user_agent, 'otp_verified', null);

  return jsonb_build_object('ok', true, 'token', v_token);
end;
$$;

revoke all on function public.verify_status_otp(text, text, text, text) from public, anon, authenticated;
grant execute on function public.verify_status_otp(text, text, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 3) Leer el estatus real: solo con un token de sesion verificada vigente.
--    Sustituye el uso publico de get_prospect_status.
-- ---------------------------------------------------------------------------

create or replace function public.get_status_by_token(
  p_display_id text,
  p_token uuid,
  p_ip text,
  p_user_agent text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_id text := upper(trim(p_display_id));
  v_session record;
  v_result jsonb;
begin
  select * into v_session
  from public.status_verified_sessions
  where token = p_token and display_id = v_display_id and expires_at > now();

  if not found then
    return jsonb_build_object('found', false, 'expired', true);
  end if;

  v_result := public.get_prospect_status(v_display_id);

  insert into public.status_lookup_audit (display_id, ip, user_agent, action, detail)
  values (v_display_id, p_ip, p_user_agent, 'status_viewed', null);

  return v_result;
end;
$$;

revoke all on function public.get_status_by_token(text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.get_status_by_token(text, uuid, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 4) Cierra el hueco: get_prospect_status ya no es invocable directamente.
--    (Sigue existiendo y sigue siendo usada internamente por get_status_by_token.)
-- ---------------------------------------------------------------------------

revoke all on function public.get_prospect_status(text) from public, anon, authenticated;
