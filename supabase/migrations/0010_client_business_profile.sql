alter table public.clients
  add column if not exists rnc text,
  add column if not exists sector text,
  add column if not exists employee_count integer,
  add column if not exists company_size text check (company_size in ('microempresa','pequena_empresa','mediana_empresa','gran_empresa')),
  add column if not exists country text,
  add column if not exists city text,
  add column if not exists website text,
  add column if not exists domain text,
  add column if not exists support_level text;

create or replace function public.set_company_size()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.employee_count is null then
    new.company_size := null;
  elsif new.employee_count < 10 then
    new.company_size := 'microempresa';
  elsif new.employee_count < 50 then
    new.company_size := 'pequena_empresa';
  elsif new.employee_count < 200 then
    new.company_size := 'mediana_empresa';
  else
    new.company_size := 'gran_empresa';
  end if;
  return new;
end;
$$;

create trigger trg_set_company_size
before insert or update of employee_count on public.clients
for each row execute function public.set_company_size();
