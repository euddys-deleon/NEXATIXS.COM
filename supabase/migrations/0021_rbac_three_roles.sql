-- Amplia staff_users.role de 2 valores (admin/staff) a 3, siguiendo el RBAC
-- pedido en el PDF de mejoras: Super Admin / Admin Operativo / Soporte.
--
-- Mapeo de datos existentes (decision de negocio, no inferible del codigo):
--   'admin' -> 'super_admin'      (ya tenian acceso total via /superadmin)
--   'staff' -> 'admin_operativo'  (mantienen exactamente el acceso que ya
--                                   usaban hoy: clientes, tickets, servicios;
--                                   is_staff() nunca diferencio por rol antes
--                                   de esta migracion, asi que "staff" ya
--                                   tocaba facturas/licencias en la practica)
--
-- Alcance de las policies que se restringen en este archivo: solo las tablas
-- que el PDF menciona explicitamente en la matriz de permisos (facturacion,
-- licencias, catalogo de servicios, clientes, planes/config, y la propia
-- staff_users). El resto de las 21 policies gated en is_staff() (prospects,
-- projects, tickets, client_contacts, appointments, audit_log, attachments,
-- etc.) se deja igual a proposito: el PDF no las menciona y diferenciarlas
-- sin un requisito concreto es adivinar, no implementar.

-- ---------------------------------------------------------------------------
-- 1) Migrar los datos ANTES de cambiar el check constraint.
-- ---------------------------------------------------------------------------

alter table public.staff_users drop constraint staff_users_role_check;

update public.staff_users set role = 'super_admin' where role = 'admin';
update public.staff_users set role = 'admin_operativo' where role = 'staff';

alter table public.staff_users
  add constraint staff_users_role_check
  check (role in ('super_admin', 'admin_operativo', 'soporte'));

alter table public.staff_users alter column role set default 'admin_operativo';

-- ---------------------------------------------------------------------------
-- 2) Helpers de rol. is_staff() se deja intacta (cualquiera de los 3 roles
--    sigue contando como "staff" para las 15 policies que no se tocan aqui).
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 3) Facturacion y licencias: Soporte queda excluido por completo (no esta
--    en su lista de "puede", y el PDF prohibe explicitamente que modifique
--    facturacion/licencias).
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 4) Catalogo de servicios: Soporte solo "ve estados de servicios", no
--    gestiona el catalogo.
-- ---------------------------------------------------------------------------

drop policy "staff_manage_services_catalog" on public.services_catalog;
create policy "staff_select_services_catalog" on public.services_catalog
  for select using (public.is_staff());
create policy "admin_operativo_write_services_catalog" on public.services_catalog
  for insert with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_update_services_catalog" on public.services_catalog
  for update using (public.is_admin_operativo_or_above()) with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_delete_services_catalog" on public.services_catalog
  for delete using (public.is_admin_operativo_or_above());

-- ---------------------------------------------------------------------------
-- 5) Clientes: Soporte "ve clientes" (no los gestiona/edita).
-- ---------------------------------------------------------------------------

drop policy "staff_all_clients" on public.clients;
create policy "staff_select_clients" on public.clients
  for select using (public.is_staff());
create policy "admin_operativo_write_clients" on public.clients
  for insert with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_update_clients" on public.clients
  for update using (public.is_admin_operativo_or_above()) with check (public.is_admin_operativo_or_above());
create policy "admin_operativo_delete_clients" on public.clients
  for delete using (public.is_admin_operativo_or_above());

-- ---------------------------------------------------------------------------
-- 6) Planes/precios = "configuracion critica": solo Super Admin modifica.
-- ---------------------------------------------------------------------------

drop policy "staff_all_plans" on public.plans;
create policy "staff_select_plans" on public.plans
  for select using (public.is_staff());
create policy "super_admin_write_plans" on public.plans
  for insert with check (public.is_super_admin());
create policy "super_admin_update_plans" on public.plans
  for update using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_delete_plans" on public.plans
  for delete using (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- 7) staff_users: hoy solo existia policy de SELECT (las cuentas se crean a
--    mano desde el dashboard de Supabase). Se agregan policies de escritura
--    para que, el dia que exista una UI de gestion de staff, solo Super Admin
--    pueda crear/editar staff — y en particular, solo Super Admin puede
--    asignar el rol 'super_admin' (Admin Operativo no puede crear Super
--    Admins, tal como pide el PDF).
-- ---------------------------------------------------------------------------

create policy "super_admin_insert_staff_users" on public.staff_users
  for insert with check (public.is_super_admin());
create policy "super_admin_update_staff_users" on public.staff_users
  for update using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_delete_staff_users" on public.staff_users
  for delete using (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- 8) Asignacion de citas: el round-robin de ejecutivos ya no debe incluir a
--    Soporte (no es rol de ventas/cuentas). Cuerpo identico al original de
--    0018_appointments.sql — el UNICO cambio real es el filtro de rol en el
--    cursor v_executive (antes "s.role = 'admin'").
-- ---------------------------------------------------------------------------

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
