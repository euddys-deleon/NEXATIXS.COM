-- Sistema de citas propio: agenda con los 3 ejecutivos (staff_users.role = 'admin'),
-- asignacion balanceada (round-robin por carga) y prevencion de choques de horario
-- garantizada a nivel de base de datos (constraint de exclusion, no solo aplicacion).

create extension if not exists btree_gist;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospects(id) on delete set null,
  executive_id uuid not null references public.staff_users(id),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  channel text not null check (channel in ('meet', 'whatsapp')),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30,
  -- Set explicitly by book_appointment() at insert time (a GENERATED column can't
  -- use tstzrange(), which Postgres classifies as STABLE rather than IMMUTABLE).
  time_range tstzrange not null,
  status text not null default 'confirmada' check (status in ('confirmada', 'cancelada', 'completada')),
  notes text,
  created_at timestamptz not null default now(),
  exclude using gist (executive_id with =, time_range with &&) where (status <> 'cancelada')
);

alter table public.appointments enable row level security;

create policy "staff_all_appointments" on public.appointments
  for all using (public.is_staff())
  with check (public.is_staff());

-- El propio ejecutivo asignado tambien puede ver sus citas (ya cubierto por is_staff()
-- para todo el staff, pero se deja explicito el select publico solo via la RPC de abajo).

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
    where s.role = 'admin'
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

grant execute on function public.book_appointment(
  uuid, text, text, text, text, timestamptz, integer
) to anon, authenticated;
