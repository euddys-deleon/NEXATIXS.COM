-- NEXATIXS Identity Center (NIC) — alcance reducido, extendiendo lo que ya
-- existe (public.clients, public.staff_users, public.client_users, RLS via
-- is_staff()/current_client_id()) en vez de un proveedor de identidad
-- separado. Ver analisis en el Cerebro: services_catalog/licenses/plans ya
-- cubren buena parte de lo pedido; esto agrega solo lo que genuinamente no
-- existia.

-- ---------------------------------------------------------------------------
-- 1) NXT-ID: identificador de cliente, formato NXT-YYYY-NNNNN, autogenerado.
--    Permite iniciar sesion con NXT-ID o correo (ver /api/auth/login).
-- ---------------------------------------------------------------------------

create sequence public.clients_nxt_seq;

create or replace function public.set_client_nxt_id()
returns trigger
language plpgsql
as $$
begin
  if new.nxt_id is null then
    new.nxt_id := 'NXT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.clients_nxt_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

alter table public.clients add column nxt_id text unique;

create trigger clients_set_nxt_id
  before insert on public.clients
  for each row execute function public.set_client_nxt_id();

-- Backfill defensivo por si algun cliente ya existiera sin pasar por el
-- trigger (no aplica hoy — 0 filas — pero deja la columna consistente).
update public.clients set nxt_id = 'NXT-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('public.clients_nxt_seq')::text, 5, '0')
where nxt_id is null;

alter table public.clients alter column nxt_id set not null;

-- ---------------------------------------------------------------------------
-- 2) Catalogo real de herramientas/sistemas (Portal Cliente, NAH, SOC
--    Dashboard, SIEM, etc.) — distinto de services_catalog (catalogo de
--    marketing para upsell, sin url/version/estado de sistema real).
-- ---------------------------------------------------------------------------

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  url text,
  status text not null default 'activa' check (status in ('activa', 'mantenimiento', 'inactiva')),
  version text,
  created_at timestamptz not null default now()
);

alter table public.tools enable row level security;

create policy "staff_all_tools" on public.tools
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 3) Asignacion de herramientas por cliente (equivalente a "user_tools" del
--    brief, pero a nivel de cliente/empresa, igual que licenses).
-- ---------------------------------------------------------------------------

create table public.client_tools (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  status text not null default 'activa' check (status in ('activa', 'suspendida')),
  assigned_at timestamptz not null default now(),
  unique (client_id, tool_id)
);

alter table public.client_tools enable row level security;

create policy "staff_all_client_tools" on public.client_tools
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "client_tools_select_own_client" on public.client_tools
  for select to authenticated
  using (client_id = public.current_client_id());

-- El cliente ve el detalle (nombre/url/version) de las herramientas que le
-- fueron asignadas, no el catalogo completo.
create policy "client_users_select_assigned_tools" on public.tools
  for select to authenticated
  using (id in (select tool_id from public.client_tools where client_id = public.current_client_id()));
