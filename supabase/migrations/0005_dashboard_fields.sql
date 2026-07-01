-- Fase 6a: campos necesarios para el Dashboard del Portal de Cliente (7.1)
-- y el futuro Gestor de Licencias (7.2).

alter table public.projects
  add column if not exists progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  add column if not exists start_date date,
  add column if not exists estimated_end_date date;

alter table public.licenses
  add column if not exists usage_percent integer check (usage_percent between 0 and 100),
  add column if not exists category text,
  add column if not exists expires_at date;
