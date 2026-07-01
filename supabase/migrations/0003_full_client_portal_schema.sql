-- Fase 5: esquema completo del Portal de Cliente + RLS + Auth
-- Aplicado directamente al proyecto Supabase "nexatixs" via MCP.

alter table public.clients add column if not exists contract_start_date date;

create table if not exists public.client_users (
  id uuid primary key references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  full_name text not null,
  role text not null default 'usuario_estandar' check (role in ('admin_cliente','usuario_estandar')),
  created_at timestamptz not null default now()
);

create table if not exists public.project_status_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  phase text not null check (phase in (
    'contacto_inicial','entrevista_virtual','auditoria_levantamiento',
    'propuesta_cotizacion','firma_contrato','desarrollo_implementacion'
  )),
  notes text,
  changed_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  created_by uuid references public.client_users(id) on delete set null,
  category text not null,
  priority text not null default 'media' check (priority in ('baja','media','alta','urgente')),
  status text not null default 'abierto' check (status in ('abierto','en_progreso','resuelto')),
  subject text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid references public.client_users(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.upsell_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  requested_by uuid references public.client_users(id) on delete set null,
  item_name text not null,
  description text,
  status text not null default 'pendiente' check (status in ('pendiente','aprobada','rechazada')),
  created_at timestamptz not null default now()
);

create table if not exists public.services_catalog (
  id uuid primary key default gen_random_uuid(),
  pillar_slug text not null check (pillar_slug in ('desarrollo','infraestructura','automatizacion','cloud','ciberseguridad','soporte')),
  item_name text not null,
  is_upsell_eligible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.client_users enable row level security;
alter table public.project_status_history enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.upsell_requests enable row level security;
alter table public.services_catalog enable row level security;

-- Helper SECURITY DEFINER: evita recursion de RLS al resolver el client_id
-- del usuario autenticado actual, usado por todas las policies de abajo.
create or replace function public.current_client_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select client_id from public.client_users where id = auth.uid();
$$;

grant execute on function public.current_client_id() to authenticated;

create policy "clients_select_own" on public.clients
  for select to authenticated
  using (id = public.current_client_id());

create policy "client_users_select_same_org" on public.client_users
  for select to authenticated
  using (id = auth.uid() or client_id = public.current_client_id());

create policy "projects_select_own_client" on public.projects
  for select to authenticated
  using (client_id = public.current_client_id());

create policy "project_status_history_select_own_client" on public.project_status_history
  for select to authenticated
  using (project_id in (select id from public.projects where client_id = public.current_client_id()));

create policy "licenses_select_own_client" on public.licenses
  for select to authenticated
  using (client_id = public.current_client_id());

create policy "tickets_select_own_client" on public.tickets
  for select to authenticated
  using (client_id = public.current_client_id());

create policy "tickets_insert_own_client" on public.tickets
  for insert to authenticated
  with check (client_id = public.current_client_id());

create policy "ticket_messages_select_own_client" on public.ticket_messages
  for select to authenticated
  using (ticket_id in (select id from public.tickets where client_id = public.current_client_id()));

create policy "ticket_messages_insert_own_client" on public.ticket_messages
  for insert to authenticated
  with check (ticket_id in (select id from public.tickets where client_id = public.current_client_id()));

create policy "upsell_requests_select_own_client" on public.upsell_requests
  for select to authenticated
  using (client_id = public.current_client_id());

create policy "upsell_requests_insert_own_client" on public.upsell_requests
  for insert to authenticated
  with check (client_id = public.current_client_id());

-- Catalogo de referencia, no sensible: lectura publica para el sitio y el portal.
create policy "services_catalog_public_read" on public.services_catalog
  for select
  using (true);
