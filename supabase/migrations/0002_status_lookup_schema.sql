-- Fase 4: consulta de estatus publica por ID
-- Aplicado directamente al proyecto Supabase "nexatixs" via MCP.

alter table public.prospects
  add column if not exists pipeline_phase text not null default 'contacto_inicial'
  check (pipeline_phase in (
    'contacto_inicial',
    'entrevista_virtual',
    'auditoria_levantamiento',
    'propuesta_cotizacion',
    'firma_contrato',
    'desarrollo_implementacion'
  ));

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid unique references public.prospects(id) on delete set null,
  company_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  status text not null check (status in ('en_desarrollo','completado','en_cola','en_soporte')),
  created_at timestamptz not null default now()
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  status text not null check (status in ('activa','por_vencer','expirada')),
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.licenses enable row level security;

create or replace function public.get_prospect_status(p_display_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prospect record;
  v_client record;
begin
  select id, display_id, form_type, category, status, pipeline_phase, created_at
  into v_prospect
  from public.prospects
  where display_id = p_display_id;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  if v_prospect.status = 'cliente_activo' then
    select id, company_name into v_client from public.clients where prospect_id = v_prospect.id;

    if v_client.id is not null then
      return jsonb_build_object(
        'found', true,
        'displayId', v_prospect.display_id,
        'status', v_prospect.status,
        'isClient', true,
        'companyName', v_client.company_name,
        'projects', (
          select coalesce(jsonb_agg(jsonb_build_object('name', name, 'status', status)), '[]'::jsonb)
          from public.projects where client_id = v_client.id
        ),
        'licenses', (
          select coalesce(jsonb_agg(jsonb_build_object('name', name, 'status', status)), '[]'::jsonb)
          from public.licenses where client_id = v_client.id
        )
      );
    end if;
  end if;

  return jsonb_build_object(
    'found', true,
    'displayId', v_prospect.display_id,
    'status', v_prospect.status,
    'isClient', false,
    'pipelinePhase', v_prospect.pipeline_phase,
    'createdAt', v_prospect.created_at
  );
end;
$$;

revoke all on function public.get_prospect_status(text) from public;
grant execute on function public.get_prospect_status(text) to anon, authenticated;
