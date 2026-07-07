create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  changed_by uuid references auth.users(id),
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "staff_select_audit_log" on public.audit_log
  for select using (public.is_staff());

create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (table_name, record_id, action, changed_by, old_data, new_data)
  values (
    TG_TABLE_NAME,
    coalesce(new.id, old.id),
    TG_OP,
    auth.uid(),
    case when TG_OP in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when TG_OP in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  if TG_OP = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trg_audit_clients after insert or update or delete on public.clients for each row execute function public.log_audit_event();
create trigger trg_audit_invoices after insert or update or delete on public.invoices for each row execute function public.log_audit_event();
create trigger trg_audit_tickets after insert or update or delete on public.tickets for each row execute function public.log_audit_event();
create trigger trg_audit_licenses after insert or update or delete on public.licenses for each row execute function public.log_audit_event();
create trigger trg_audit_projects after insert or update or delete on public.projects for each row execute function public.log_audit_event();
create trigger trg_audit_upsell_requests after insert or update or delete on public.upsell_requests for each row execute function public.log_audit_event();
create trigger trg_audit_client_contacts after insert or update or delete on public.client_contacts for each row execute function public.log_audit_event();
