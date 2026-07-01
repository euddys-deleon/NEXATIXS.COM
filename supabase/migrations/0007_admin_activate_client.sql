-- Fase 8: conversion de prospecto a cliente activo, sin requerir la
-- service_role key. El staff crea manualmente el usuario de Auth
-- (email/password) desde el Dashboard de Supabase, y esta funcion
-- solo vincula ese usuario ya existente con un nuevo cliente.

create or replace function public.admin_activate_client(
  p_prospect_id uuid,
  p_auth_email text,
  p_company_name text,
  p_contact_full_name text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid;
  v_client_id uuid;
begin
  if not public.is_staff() then
    raise exception 'not_authorized';
  end if;

  select id into v_auth_user_id from auth.users where email = p_auth_email;
  if v_auth_user_id is null then
    raise exception 'auth_user_not_found';
  end if;

  if exists(select 1 from public.client_users where id = v_auth_user_id) then
    raise exception 'auth_user_already_linked';
  end if;

  insert into public.clients (prospect_id, company_name, contract_start_date)
  values (p_prospect_id, p_company_name, current_date)
  returning id into v_client_id;

  insert into public.client_users (id, client_id, full_name, role)
  values (v_auth_user_id, v_client_id, p_contact_full_name, 'admin_cliente');

  update public.prospects set status = 'cliente_activo' where id = p_prospect_id;

  return v_client_id;
end;
$$;

revoke all on function public.admin_activate_client(uuid, text, text, text) from public;
grant execute on function public.admin_activate_client(uuid, text, text, text) to authenticated;
