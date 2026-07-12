create table public.plans (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('web','herramientas','redes_sociales')),
  name text not null,
  price numeric(12,2),
  currency text not null default 'USD',
  billing_period text not null default 'mensual' check (billing_period in ('mensual','anual','unico')),
  description text,
  features jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "plans_select_active" on public.plans
  for select using (active = true);

create policy "staff_all_plans" on public.plans
  for all using (public.is_staff())
  with check (public.is_staff());
