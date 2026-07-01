-- Fase 8: rol de staff interno (los 3 CEOs) con acceso administrativo.

create table if not exists public.staff_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'staff' check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);

alter table public.staff_users enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(select 1 from public.staff_users where id = auth.uid());
$$;

grant execute on function public.is_staff() to authenticated;

create policy "staff_users_select_self_or_staff" on public.staff_users
  for select to authenticated
  using (id = auth.uid() or public.is_staff());

create policy "staff_select_prospects" on public.prospects
  for select to authenticated using (public.is_staff());

create policy "staff_update_prospects" on public.prospects
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_all_clients" on public.clients
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_all_client_users" on public.client_users
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_all_projects" on public.projects
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_all_project_status_history" on public.project_status_history
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_all_licenses" on public.licenses
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_all_tickets" on public.tickets
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_all_ticket_messages" on public.ticket_messages
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_all_upsell_requests" on public.upsell_requests
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff_manage_services_catalog" on public.services_catalog
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
