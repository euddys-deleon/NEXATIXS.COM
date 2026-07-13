-- Sistema de soporte tecnico: formulario publico en /soporte que crea un ticket.
-- Ademas, cablea notificacion por correo obligatoria (no depende del cliente):
-- un trigger AFTER INSERT llama, via pg_net, a la Edge Function `notify-email`,
-- que reenvia el aviso a soporte@nexatixs.com (y, para citas, confirma al solicitante)
-- usando un remitente corporativo (Resend) en vez de una cuenta generica/personal.

create extension if not exists pg_net;

create sequence if not exists public.support_ticket_number_seq;

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  subject text not null,
  message text not null,
  status text not null default 'abierto' check (status in ('abierto', 'en_progreso', 'resuelto', 'cerrado')),
  created_at timestamptz not null default now()
);

comment on table public.support_tickets is 'Tickets de soporte tecnico generados desde /soporte. Sin policies RLS directas de escritura publica: solo accesible via la funcion SECURITY DEFINER create_support_ticket y por staff.';

alter table public.support_tickets enable row level security;

create policy "staff_all_support_tickets" on public.support_tickets
  for all using (public.is_staff())
  with check (public.is_staff());

-- Config interna (URL del proyecto) usada por los triggers para invocar la Edge Function.
-- La anon key es publica (la misma que ya viaja en el bundle del cliente), por lo que es
-- seguro guardarla en una migracion versionada; no es un secreto de servidor.
create table if not exists public._internal_config (
  key text primary key,
  value text not null
);

insert into public._internal_config (key, value) values
  ('project_url', 'https://skavgqahgazswhivxltk.supabase.co'),
  ('anon_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXZncWFoZ2F6c3doaXZ4bHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4OTI5MzAsImV4cCI6MjA5ODQ2ODkzMH0.VBrtI4jG16NIOC0G-i0i2mjmwNAWzzvUq7RVVFy9dBc')
on conflict (key) do nothing;

revoke all on table public._internal_config from anon, authenticated;

create or replace function public._notify_email(p_type text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_anon_key text;
begin
  select value into v_url from public._internal_config where key = 'project_url';
  select value into v_anon_key from public._internal_config where key = 'anon_key';

  if v_url is null then
    return;
  end if;

  perform net.http_post(
    url := v_url || '/functions/v1/notify-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := jsonb_build_object('type', p_type, 'id', p_id)
  );
exception when others then
  -- La notificacion por correo nunca debe hacer fallar la operacion de negocio
  -- (creacion del ticket / cita). Los errores de envio se observan en los logs
  -- de la Edge Function, no aqui.
  null;
end;
$$;

create or replace function public._notify_support_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public._notify_email('support_ticket', new.id);
  return new;
end;
$$;

create trigger trg_notify_support_ticket
  after insert on public.support_tickets
  for each row execute function public._notify_support_ticket();

create or replace function public._notify_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public._notify_email('appointment', new.id);
  return new;
end;
$$;

create trigger trg_notify_appointment
  after insert on public.appointments
  for each row execute function public._notify_appointment();

create or replace function public.create_support_ticket(
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_subject text,
  p_message text
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_id text;
begin
  v_display_id := 'TK-' || extract(year from now())::text || '-' || lpad(nextval('support_ticket_number_seq')::text, 5, '0');

  insert into public.support_tickets (display_id, contact_name, contact_email, contact_phone, subject, message)
  values (v_display_id, p_contact_name, p_contact_email, p_contact_phone, p_subject, p_message);

  return v_display_id;
end;
$$;

revoke all on function public.create_support_ticket(text, text, text, text, text) from public;
grant execute on function public.create_support_ticket(text, text, text, text, text) to anon, authenticated;
