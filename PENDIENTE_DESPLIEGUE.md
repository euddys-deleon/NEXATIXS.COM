# Pendiente de despliegue — NEXATIXS (Supabase)

> **Para el Claude que ejecute esto**: este documento es autocontenido — no necesitas ningún otro archivo del proyecto, todo el SQL y código necesario está incrustado abajo. Documenta trabajo ya hecho y verificado (código completo, compilación limpia, probado en navegador local en otra máquina), pero **nunca aplicado a la base de datos Supabase real**. Tu tarea es aplicar lo que sigue tal cual está escrito — no lo rediseñes ni lo reescribas de memoria. En la sesión donde se escribió este código hubo un incidente real: se reconstruyó una función SQL de memoria en vez de leerla, con parámetros y lógica inventados que habrían roto producción. Se detectó a tiempo, pero por eso este documento incluye el SQL exacto en vez de solo describirlo — cópialo tal cual, no lo parafrasees.

## Contexto

- Proyecto: sitio web corporativo de NEXATIXS, Next.js 16 + Supabase (Postgres + Auth + Storage).
- Proyecto Supabase real: `skavgqahgazswhivxltk.supabase.co`.
- Numeración de migraciones: `0001` a `0019` ya estaban aplicadas antes de este trabajo. Las que faltan son **0020 a 0027**, en ese orden — cada una depende de que la anterior ya esté aplicada.
- Todo esto se desarrolló sobre una copia local de la página. Si la carpeta donde estás trabajando ya es la de producción, ignora esa distinción; si no, falta decidir cómo migrar el código — ver el final de este documento.

## Cómo aplicarlo (sin necesitar el repo ni el CLI de Supabase configurado)

La forma más simple, que no requiere `supabase` CLI vinculado a este proyecto: entra al **Dashboard de Supabase → tu proyecto → SQL Editor**, pega el bloque de SQL de cada migración (en orden, uno a la vez) y dale a **Run**. Confirma que no haya errores antes de pasar a la siguiente. Si prefieres el CLI: `supabase login`, `supabase link --project-ref skavgqahgazswhivxltk`, y luego `supabase db push` con estos archivos guardados localmente como `supabase/migrations/00XX_....sql`.

---

## Migración 1 de 8 — `0020_status_lookup_otp.sql`

**Qué hace**: cierra una vulnerabilidad real (IDOR). La consulta pública de estatus de un prospecto/cliente (`/consulta-estatus`) dejaba ver empresa, proyectos y licencias de cualquiera con solo saber o adivinar su ID (ej. `NXT-2026-00042`). Agrega verificación por correo + código OTP de 6 dígitos (vence en 5 min, un solo uso), rate limiting (5 solicitudes/15min por IP), bloqueo (5 códigos incorrectos/30min), anti-enumeración (respuesta idéntica exista o no el ID/correo), y auditoría dedicada. Revoca el acceso público directo a la función SQL original.

```sql
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

  if v_matched then
    v_otp := lpad(floor(random() * 1000000)::text, 6, '0');
    v_otp_hash := encode(digest(v_otp || v_display_id, 'sha256'), 'hex');

    insert into public.status_otp_requests (display_id, email, otp_hash, expires_at, ip, user_agent)
    values (v_display_id, v_email, v_otp_hash, now() + interval '5 minutes', p_ip, p_user_agent);
  end if;

  insert into public.status_lookup_audit (display_id, email, ip, user_agent, action, detail)
  values (v_display_id, v_email, p_ip, p_user_agent, 'otp_requested', case when v_matched then 'match' else 'no_match' end);

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

revoke all on function public.get_prospect_status(text) from public, anon, authenticated;
```

**Verificación**: `select count(*) from information_schema.tables where table_name = 'status_otp_requests';` debe devolver `1`.

---

## Migración 2 de 8 — `0021_rbac_three_roles.sql`

**Qué hace**: amplía `staff_users.role` de 2 valores (`admin`/`staff`) a 3 (`super_admin`/`admin_operativo`/`soporte`). Migra datos existentes: `admin`→`super_admin`, `staff`→`admin_operativo` (nadie pierde acceso). Restringe por RLS: facturación y licencias fuera del alcance de Soporte; catálogo de servicios y clientes de solo lectura para Soporte; planes/precios solo editables por Super Admin; solo Super Admin puede crear otro Super Admin.

```sql
-- Amplia staff_users.role de 2 valores (admin/staff) a 3, siguiendo el RBAC
-- pedido en el PDF de mejoras: Super Admin / Admin Operativo / Soporte.
--
-- Mapeo de datos existentes (decision de negocio, no inferible del codigo):
--   'admin' -> 'super_admin'      (ya tenian acceso total via /superadmin)
--   'staff' -> 'admin_operativo'  (mantienen exactamente el acceso que ya
--                                   usaban hoy: clientes, tickets, servicios)
--
-- Alcance de las policies que se restringen en este archivo: solo las tablas
-- que el PDF menciona explicitamente en la matriz de permisos. El resto de
-- las policies gated en is_staff() se deja igual a proposito.

alter table public.staff_users drop constraint staff_users_role_check;

update public.staff_users set role = 'super_admin' where role = 'admin';
update public.staff_users set role = 'admin_operativo' where role = 'staff';

alter table public.staff_users
  add constraint staff_users_role_check
  check (role in ('super_admin', 'admin_operativo', 'soporte'));

alter table public.staff_users alter column role set default 'admin_operativo';

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.staff_users where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.is_admin_operativo_or_above()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.staff_users
    where id = auth.uid() and role in ('super_admin', 'admin_operativo')
  );
$$;

drop policy "staff_all_invoices" on public.invoices;
create policy "admin_operativo_select_invoices" on public.invoices
  for select using (public.is_admin_operativo_or_above());
create policy "admin_operativo_write_invoices" on public.invoices
  for insert with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_update_invoices" on public.invoices
  for update using (public.is_admin_operativo_or_above()) with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_delete_invoices" on public.invoices
  for delete using (public.is_admin_operativo_or_above());

drop policy "staff_all_licenses" on public.licenses;
create policy "admin_operativo_select_licenses" on public.licenses
  for select using (public.is_admin_operativo_or_above());
create policy "admin_operativo_write_licenses" on public.licenses
  for insert with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_update_licenses" on public.licenses
  for update using (public.is_admin_operativo_or_above()) with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_delete_licenses" on public.licenses
  for delete using (public.is_admin_operativo_or_above());

drop policy "staff_manage_services_catalog" on public.services_catalog;
create policy "staff_select_services_catalog" on public.services_catalog
  for select using (public.is_staff());
create policy "admin_operativo_write_services_catalog" on public.services_catalog
  for insert with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_update_services_catalog" on public.services_catalog
  for update using (public.is_admin_operativo_or_above()) with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_delete_services_catalog" on public.services_catalog
  for delete using (public.is_admin_operativo_or_above());

drop policy "staff_all_clients" on public.clients;
create policy "staff_select_clients" on public.clients
  for select using (public.is_staff());
create policy "admin_operativo_write_clients" on public.clients
  for insert with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_update_clients" on public.clients
  for update using (public.is_admin_operativo_or_above()) with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_delete_clients" on public.clients
  for delete using (public.is_admin_operativo_or_above());

drop policy "staff_all_plans" on public.plans;
create policy "staff_select_plans" on public.plans
  for select using (public.is_staff());
create policy "super_admin_write_plans" on public.plans
  for insert with check (public.is_super_admin());
create policy "super_admin_update_plans" on public.plans
  for update using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_delete_plans" on public.plans
  for delete using (public.is_super_admin());

create policy "super_admin_insert_staff_users" on public.staff_users
  for insert with check (public.is_super_admin());
create policy "super_admin_update_staff_users" on public.staff_users
  for update using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_delete_staff_users" on public.staff_users
  for delete using (public.is_super_admin());

create or replace function public.book_appointment(
  p_prospect_id uuid,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_channel text,
  p_scheduled_at timestamptz,
  p_duration_minutes integer default 30
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_executive record;
  v_appointment_id uuid;
  v_chosen_name text;
  v_local_dow int;
  v_local_hour int;
begin
  if p_scheduled_at <= now() then
    raise exception 'INVALID_TIME';
  end if;

  if p_channel not in ('meet', 'whatsapp') then
    raise exception 'INVALID_CHANNEL';
  end if;

  v_local_dow := extract(dow from p_scheduled_at at time zone 'America/Santo_Domingo');
  v_local_hour := extract(hour from p_scheduled_at at time zone 'America/Santo_Domingo');
  if v_local_dow in (0, 6) or v_local_hour < 8 or v_local_hour >= 18 then
    raise exception 'OUTSIDE_BUSINESS_HOURS';
  end if;

  for v_executive in
    select
      s.id,
      s.full_name,
      (
        select count(*)
        from public.appointments a
        where a.executive_id = s.id
          and a.status <> 'cancelada'
          and a.scheduled_at >= now()
      ) as upcoming_count
    from public.staff_users s
    where s.role in ('super_admin', 'admin_operativo')
    order by upcoming_count asc, random()
  loop
    begin
      insert into public.appointments (
        prospect_id, executive_id, contact_name, contact_email, contact_phone,
        channel, scheduled_at, duration_minutes, time_range
      ) values (
        p_prospect_id, v_executive.id, p_contact_name, p_contact_email, p_contact_phone,
        p_channel, p_scheduled_at, p_duration_minutes,
        tstzrange(p_scheduled_at, p_scheduled_at + (p_duration_minutes * interval '1 minute'), '[)')
      )
      returning id into v_appointment_id;

      v_chosen_name := v_executive.full_name;
      exit;
    exception when exclusion_violation then
      continue;
    end;
  end loop;

  if v_appointment_id is null then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  return json_build_object(
    'id', v_appointment_id,
    'executive_name', v_chosen_name,
    'scheduled_at', p_scheduled_at,
    'channel', p_channel
  );
end;
$$;
```

**Verificación**: `select role, count(*) from public.staff_users group by role;` — no debe quedar ningún registro con `role = 'admin'` o `role = 'staff'` (los valores viejos ya no deberían existir tras el `update`).

---

## Migración 3 de 8 — `0022_service_desk.sql`

**Qué hace**: amplía `tickets` de 3 a 7 estados y renombra la prioridad `urgente` a `critica`. Agrega asignación a staff, SLA automático por prioridad, escalamiento, y notas internas (solo staff, invisibles para el cliente) en `ticket_messages`.

```sql
-- Amplia public.tickets (el sistema de tickets del portal de clientes, el
-- unico que ya tiene chat + adjuntos conectados) al Service Desk que pide el
-- PDF: 7 estados, 4 prioridades (renombra 'urgente' -> 'critica'), asignacion
-- a staff, SLA, escalamiento, y notas internas (staff-only) en el chat.
--
-- Deliberadamente NO se toca public.support_tickets: es un sistema aparte.

alter table public.tickets drop constraint tickets_priority_check;
update public.tickets set priority = 'critica' where priority = 'urgente';
alter table public.tickets
  add constraint tickets_priority_check
  check (priority in ('baja', 'media', 'alta', 'critica'));

alter table public.tickets drop constraint tickets_status_check;
alter table public.tickets
  add constraint tickets_status_check
  check (status in (
    'abierto', 'en_revision', 'asignado', 'en_progreso',
    'pendiente_cliente', 'resuelto', 'cerrado'
  ));

alter table public.tickets add column assigned_to uuid references public.staff_users(id) on delete set null;
alter table public.tickets add column sla_due_at timestamptz;
alter table public.tickets add column first_response_at timestamptz;
alter table public.tickets add column escalated boolean not null default false;
alter table public.tickets add column escalated_at timestamptz;

create or replace function public.set_ticket_sla_due_at()
returns trigger
language plpgsql
as $$
begin
  if new.sla_due_at is null then
    new.sla_due_at := new.created_at + case new.priority
      when 'critica' then interval '4 hours'
      when 'alta' then interval '24 hours'
      when 'media' then interval '48 hours'
      else interval '72 hours'
    end;
  end if;
  return new;
end;
$$;

create trigger trg_tickets_set_sla_due_at
  before insert on public.tickets
  for each row execute function public.set_ticket_sla_due_at();

update public.tickets set sla_due_at = created_at + case priority
  when 'critica' then interval '4 hours'
  when 'alta' then interval '24 hours'
  when 'media' then interval '48 hours'
  else interval '72 hours'
end
where sla_due_at is null;

alter table public.ticket_messages add column is_internal boolean not null default false;

alter table public.ticket_messages add column staff_author_id uuid references public.staff_users(id) on delete set null;
alter table public.ticket_messages add constraint ticket_messages_single_author_check
  check (not (author_id is not null and staff_author_id is not null));

drop policy "ticket_messages_select_own_client" on public.ticket_messages;
create policy "ticket_messages_select_own_client" on public.ticket_messages
  for select to authenticated
  using (
    is_internal = false
    and ticket_id in (select id from public.tickets where client_id = public.current_client_id())
  );

drop policy "ticket_messages_insert_own_client" on public.ticket_messages;
create policy "ticket_messages_insert_own_client" on public.ticket_messages
  for insert to authenticated
  with check (
    is_internal = false
    and staff_author_id is null
    and ticket_id in (select id from public.tickets where client_id = public.current_client_id())
  );
```

**Verificación**: `select distinct priority from public.tickets;` no debe mostrar `urgente`, solo `baja/media/alta/critica`.

---

## Migración 4 de 8 — `0023_license_and_service_management.sql`

**Qué hace**: agrega cantidad de asientos y asignación a usuario en `licenses` (para agregar/reducir asientos y transferir entre usuarios del mismo cliente).

```sql
-- Gestion de licencias/servicios del PDF de mejoras.
-- "licenses" ya modela lo que el PDF llama "servicios" por cliente via el
-- campo category. Falta: cantidad (seats) y a que usuario esta asignada.

alter table public.licenses add column if not exists seats integer not null default 1 check (seats >= 0);
alter table public.licenses add column if not exists assigned_to uuid references public.client_users(id) on delete set null;
```

**Verificación**: `select column_name from information_schema.columns where table_name = 'licenses' and column_name in ('seats','assigned_to');` debe devolver 2 filas.

---

## Migración 5 de 8 — `0024_file_upload_hardening.sql`

**Qué hace**: restringe los tipos de archivo permitidos en el bucket de adjuntos (antes solo tenía límite de tamaño). Habilita RLS en `_internal_config` (única tabla del esquema que no lo tenía).

```sql
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

alter table public._internal_config enable row level security;
```

**Verificación**: `select allowed_mime_types from storage.buckets where id = 'attachments';` debe mostrar la lista de tipos, no `null`.

---

## Migración 6 de 8 — `0025_mfa_enforcement.sql`

⚠️ **Esta migración cambia comportamiento real de producción.** Avisar al equipo antes de aplicarla: cualquier miembro del staff sin MFA (TOTP) configurado queda **sin acceso a los datos** hasta que lo complete (la interfaz ya los redirige a configurarlo, pero ahora también se exige a nivel de base de datos).

**Qué hace**: `is_staff()` (usada por ~20 políticas RLS) ahora exige que la sesión tenga el segundo factor completado (`aal2`), no solo que exista una cuenta de staff. Antes, una sesión con solo contraseña (sin MFA) tenía acceso completo a los datos a través de la base de datos, aunque la interfaz redirigiera a configurar 2FA.

```sql
create or replace function public.is_staff_account()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.staff_users where id = auth.uid());
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_staff_account() and (select auth.jwt() ->> 'aal') = 'aal2';
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.staff_users where id = auth.uid() and role = 'super_admin'
  ) and (select auth.jwt() ->> 'aal') = 'aal2';
$$;

create or replace function public.is_admin_operativo_or_above()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.staff_users
    where id = auth.uid() and role in ('super_admin', 'admin_operativo')
  ) and (select auth.jwt() ->> 'aal') = 'aal2';
$$;

drop policy "staff_users_select_self_or_staff" on public.staff_users;
create policy "staff_users_select_self_or_staff" on public.staff_users
  for select using (public.is_staff_account());
```

**Verificación**: iniciar sesión como un staff con MFA ya configurado y confirmar que `/admin` sigue funcionando con normalidad. Si alguien reporta que perdió acceso, es esperado — debe completar el enrolamiento de 2FA en `/configurar-2fa`.

---

## Migración 7 de 8 — `0026_auth_rate_limiting.sql`

**Qué hace**: crea la tabla y funciones para rate limiting real de login (5 intentos/15min) y verificación 2FA (5 intentos/30min). **Requiere** que el código de la app ya tenga las rutas de servidor `src/app/api/auth/login` y `src/app/api/auth/verify-2fa` (ya están en el código, ver sección de contexto de código al final).

```sql
create table public.auth_rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('login', 'mfa_verify')),
  identifier text not null,
  ip text not null,
  created_at timestamptz not null default now()
);

create index auth_rate_limits_lookup_idx on public.auth_rate_limits (scope, identifier, ip, created_at desc);

alter table public.auth_rate_limits enable row level security;

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
```

**Verificación**: `select count(*) from information_schema.tables where table_name = 'auth_rate_limits';` debe devolver `1`.

---

## Migración 8 de 8 — `0027_session_security.sql`

**Qué hace**: crea `auth_audit_log` (registro de login/logout/2FA/revocación de sesiones — el `audit_log` existente solo capturaba cambios de tablas, nunca eventos de autenticación).

```sql
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
```

**Verificación**: `select count(*) from information_schema.tables where table_name = 'auth_audit_log';` debe devolver `1`. Con esto terminan las 8 migraciones.

---

## Edge Function a desplegar — `notify-email`

Esta función ya existe en el proyecto (maneja notificaciones de tickets de soporte y citas); se le agregó un nuevo tipo `status_otp` para enviar el código de verificación de la migración 1. Hay que **reemplazar el archivo completo** `supabase/functions/notify-email/index.ts` con el contenido de abajo y desplegarlo:

```
supabase functions deploy notify-email
```

Contenido completo del archivo (reemplaza el existente, no solo agregues):

```typescript
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
      const result = await handleStatusOtp(body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!id || (type !== "support_ticket" && type !== "appointment")) {
      return new Response(JSON.stringify({ error: "invalid_payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result =
      type === "support_ticket" ? await handleSupportTicket(id) : await handleAppointment(id);

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
```

---

## Variables de entorno / secretos que hay que completar

| Dónde | Variable | Para qué | Cómo conseguirla |
|---|---|---|---|
| `.env.local` del proyecto | `SUPABASE_SERVICE_ROLE_KEY` | La usan `src/lib/supabase/admin.ts` y las rutas `/api/estatus/*` y `/api/auth/*` (login, 2FA, revocar sesiones) — sin ella esas rutas fallan con `supabaseKey is required` | Dashboard de Supabase → Project Settings → API → `service_role` key |
| `.env.local` del proyecto | `GEMINI_API_KEY` | Chatbot del portal de cliente. No es parte de este trabajo, ya estaba pendiente antes | aistudio.google.com → "Get API key" |
| Secretos de Edge Functions en Supabase (no en `.env.local`) | `RESEND_API_KEY` | Envío de todos los correos transaccionales, incluido el OTP nuevo | Verificar en Supabase Dashboard → Edge Functions → Secrets; si no está, conseguirla en resend.com |

## Contexto de código (ya existe en el repo, no hay que escribirlo)

Si quien ejecuta esto SÍ tiene acceso al código fuente (no solo a este documento), estos son los archivos relevantes ya implementados y probados localmente — no deberían necesitar cambios, solo que la base de datos los soporte:

- `src/app/api/estatus/{request-otp,verify-otp,status}/route.ts`
- `src/app/api/auth/{login,verify-2fa,revoke-sessions}/route.ts`
- `src/lib/supabase/admin.ts` (cliente con service role key)
- `src/app/[locale]/admin/tickets/`, `src/app/[locale]/admin/servicios/`
- `next.config.ts` y `src/proxy.ts` (headers de seguridad y CORS — no dependen de Supabase, ya activos)

Si quien ejecuta esto NO tiene el código fuente, avisar: las migraciones de base de datos por sí solas no activan nada en el sitio — el código de la aplicación (rutas, páginas, componentes) también tiene que estar desplegado para que estos cambios tengan efecto real.

## Pruebas a correr después de aplicar todo

- [ ] Consulta-estatus: pedir código OTP, recibir el correo, validar, ver el resultado
- [ ] Login: probar 6 intentos fallidos seguidos, confirmar bloqueo en el 6to
- [ ] 2FA: enrolar un staff nuevo, confirmar que queda bloqueado hasta completar MFA
- [ ] Centro de Tickets: crear, asignar, escalar, responder con nota interna
- [ ] Licencias: agregar/reducir asientos, transferir a otro usuario del mismo cliente
- [ ] Catálogo de servicios (`/admin/servicios`): crear, editar, eliminar
- [ ] Botón "cerrar todas las sesiones" en `/admin` y `/portal`

## Explícitamente fuera de este trabajo

No son migraciones de Supabase, requieren otra decisión de infraestructura o producto:

- Monitoreo de plataforma (uptime, errores) — herramienta externa de observabilidad
- Centro de IA / métricas de conversaciones — no existe tabla de tracking, hay que diseñarla desde cero
- CMS administrativo — proyecto de UI aparte
- Anti-DDoS / WAF — requiere Cloudflare u otro servicio externo

## Después de todo esto

Decidir cómo y cuándo migrar estos cambios de la copia de trabajo a la página original de producción, si todavía no es la misma carpeta.
