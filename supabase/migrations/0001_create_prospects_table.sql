-- Fase 3: flujo de captación público (formularios F1/F2/F3)
-- Aplicado directamente al proyecto Supabase "nexatixs" via MCP.
-- Este archivo queda como registro versionado del esquema.

create sequence if not exists public.prospect_number_seq;

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique,
  form_type text not null check (form_type in ('F1','F2','F3')),
  category text not null check (category in (
    'empresa_grande','empresa_mediana','empresa_pequena',
    'organizacion_analisis_profundo','organizacion_consulta_rapida',
    'persona_fisica'
  )),
  status text not null default 'prospecto' check (status in ('prospecto','en_evaluacion','cliente_activo','descartado')),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

comment on table public.prospects is 'Prospectos generados por el flujo de captación público (Fase 3). Sin policies RLS directas: solo accesible via la función SECURITY DEFINER create_prospect y por el rol de servicio.';

alter table public.prospects enable row level security;

create or replace function public.create_prospect(
  p_form_type text,
  p_category text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_payload jsonb
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_id text;
begin
  v_display_id := 'NXT-' || extract(year from now())::text || '-' || lpad(nextval('prospect_number_seq')::text, 5, '0');

  insert into public.prospects (display_id, form_type, category, contact_name, contact_email, contact_phone, payload)
  values (v_display_id, p_form_type, p_category, p_contact_name, p_contact_email, p_contact_phone, p_payload);

  return v_display_id;
end;
$$;

revoke all on function public.create_prospect(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_prospect(text, text, text, text, text, jsonb) to anon, authenticated;
