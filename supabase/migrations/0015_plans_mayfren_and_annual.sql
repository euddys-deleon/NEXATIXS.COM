-- Añade precio anual y una categoría propia para los planes de Mayfren.
alter table public.plans
  add column if not exists annual_price numeric(12,2);

alter table public.plans
  drop constraint if exists plans_category_check;

alter table public.plans
  add constraint plans_category_check
  check (category in ('mayfren', 'web', 'herramientas', 'redes_sociales'));
