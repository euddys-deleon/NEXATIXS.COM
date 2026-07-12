-- Permite que un usuario autenticado marque su propia contraseña como ya cambiada,
-- sin necesidad de políticas RLS de UPDATE sobre staff_users / client_users.
create or replace function public.clear_must_change_password()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.staff_users set must_change_password = false where id = auth.uid();
  update public.client_users set must_change_password = false where id = auth.uid();
end;
$$;

grant execute on function public.clear_must_change_password() to authenticated;
