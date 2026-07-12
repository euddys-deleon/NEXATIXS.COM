alter table public.staff_users
  add column if not exists must_change_password boolean not null default true;
