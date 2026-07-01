-- Fase 8: adjuntos para tickets y proyectos via Supabase Storage.

insert into storage.buckets (id, name, public, file_size_limit)
values ('attachments', 'attachments', false, 15728640)
on conflict (id) do nothing;

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('ticket','project')),
  entity_id uuid not null,
  storage_path text not null,
  file_name text not null,
  uploaded_by uuid references public.client_users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.attachments enable row level security;

create or replace function public.can_access_attachment(p_entity_type text, p_entity_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select case p_entity_type
    when 'ticket' then exists(
      select 1 from public.tickets
      where id = p_entity_id and (client_id = public.current_client_id() or public.is_staff())
    )
    when 'project' then exists(
      select 1 from public.projects
      where id = p_entity_id and (client_id = public.current_client_id() or public.is_staff())
    )
    else false
  end;
$$;

grant execute on function public.can_access_attachment(text, uuid) to authenticated;

create policy "attachments_select" on public.attachments
  for select to authenticated
  using (public.can_access_attachment(entity_type, entity_id));

create policy "attachments_insert" on public.attachments
  for insert to authenticated
  with check (public.can_access_attachment(entity_type, entity_id));

create policy "attachments_delete" on public.attachments
  for delete to authenticated
  using (public.is_staff());

create policy "attachments_storage_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'attachments'
    and public.can_access_attachment((storage.foldername(name))[1], ((storage.foldername(name))[2])::uuid)
  );

create policy "attachments_storage_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and public.can_access_attachment((storage.foldername(name))[1], ((storage.foldername(name))[2])::uuid)
  );

create policy "attachments_storage_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'attachments' and public.is_staff());
