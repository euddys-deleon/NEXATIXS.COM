create sequence if not exists public.invoice_number_seq start 1;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  invoice_number text not null unique,
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null default 'pendiente' check (status in ('pendiente','pagada','vencida','cancelada')),
  issue_date date not null default current_date,
  due_date date,
  paid_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_invoice_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := 'INV-' || extract(year from now())::text || '-' || lpad(nextval('public.invoice_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger trg_set_invoice_number
before insert on public.invoices
for each row execute function public.set_invoice_number();

alter table public.invoices enable row level security;

create policy "invoices_select_own_client" on public.invoices
  for select using (client_id = public.current_client_id());

create policy "staff_all_invoices" on public.invoices
  for all using (public.is_staff())
  with check (public.is_staff());
