create table public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  full_name text not null,
  position text,
  email text,
  phone text,
  department text,
  can_approve_quotes boolean not null default false,
  can_receive_invoices boolean not null default false,
  can_open_tickets boolean not null default false,
  can_manage_licenses boolean not null default false,
  status text not null default 'activo' check (status in ('activo','inactivo')),
  created_at timestamptz not null default now()
);

alter table public.client_contacts enable row level security;

create policy "client_contacts_select_own_client" on public.client_contacts
  for select using (client_id = public.current_client_id());

create policy "staff_all_client_contacts" on public.client_contacts
  for all using (public.is_staff())
  with check (public.is_staff());
