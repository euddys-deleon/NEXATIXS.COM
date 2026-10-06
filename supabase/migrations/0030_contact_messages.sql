-- Formulario público de contacto en /contacto (página de proyectos y contacto).
-- Sigue el mismo patrón que 0019_support_tickets_and_email_notify.sql: tabla propia,
-- función SECURITY DEFINER para la escritura pública, y notificación por correo
-- obligatoria vía trigger + pg_net + Edge Function `notify-email`.

create sequence if not exists public.contact_message_number_seq;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  company_name text,
  subject text not null,
  message text not null,
  status text not null default 'nuevo' check (status in ('nuevo', 'en_seguimiento', 'cerrado')),
  created_at timestamptz not null default now()
);

comment on table public.contact_messages is 'Mensajes del formulario público /contacto. Sin policies RLS de escritura publica: solo accesible via la funcion SECURITY DEFINER create_contact_message y por staff.';

alter table public.contact_messages enable row level security;

create policy "staff_all_contact_messages" on public.contact_messages
  for all using (public.is_staff())
  with check (public.is_staff());

create or replace function public._notify_contact_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public._notify_email('contact_message', new.id);
  return new;
end;
$$;

create trigger trg_notify_contact_message
  after insert on public.contact_messages
  for each row execute function public._notify_contact_message();

create or replace function public.create_contact_message(
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_company_name text,
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
  v_display_id := 'CT-' || extract(year from now())::text || '-' || lpad(nextval('contact_message_number_seq')::text, 5, '0');

  insert into public.contact_messages (display_id, contact_name, contact_email, contact_phone, company_name, subject, message)
  values (v_display_id, p_contact_name, p_contact_email, p_contact_phone, p_company_name, p_subject, p_message);

  return v_display_id;
end;
$$;

revoke all on function public.create_contact_message(text, text, text, text, text, text) from public;
grant execute on function public.create_contact_message(text, text, text, text, text, text) to anon, authenticated;
