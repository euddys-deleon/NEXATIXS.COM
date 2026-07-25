-- MFA obligatorio para staff (PDF: "MFA Obligatorio para: Super Admin, Admin
-- Operativo, Soporte") — a nivel de RLS, no solo de UI.
--
-- Hallazgo real: src/lib/auth/security-gate.ts ya FUERZA a cualquier staff a
-- pasar por /configurar-2fa y /verificar-2fa antes de poder navegar el sitio
-- (getSecurityGateRedirect, invocado desde admin/layout.tsx y
-- superadmin/layout.tsx). Pero eso es un redirect a nivel de UI de Next.js —
-- is_staff()/is_super_admin()/is_admin_operativo_or_above() (usadas en las
-- ~21 policies de RLS que protegen los datos reales) solo comprueban que
-- exista una fila en staff_users, nunca el nivel de autenticacion (AAL) de la
-- sesion actual. Una sesion aal1 (password sin completar MFA) — por ejemplo
-- un token robado antes de que su dueno complete el paso de MFA, o cualquier
-- llamada directa a la API de Supabase que se salte la UI del sitio — sigue
-- teniendo acceso total a nivel de base de datos. Este es exactamente el
-- principio Zero Trust del PDF: "nunca confiar en datos provenientes del
-- cliente... toda autorizacion debe validarse en el backend". El backend
-- aqui es Postgres/RLS, no el layout de Next.js.
--
-- Fix: is_staff() ahora tambien exige aal2. Como las otras ~20 policies
-- llaman a is_staff() por nombre (no reimplementan la logica), heredan el
-- requisito de MFA automaticamente sin tocarlas una por una. La UNICA
-- excepcion es la lectura de la propia fila de staff_users (necesaria para
-- que el gate de UI pueda saber quien es el usuario y mandarlo a
-- /configurar-2fa en primer lugar) — para eso se separa is_staff_account(),
-- sin el chequeo de AAL, y solo esa policy se re-apunta a ella.

create or replace function public.is_staff_account()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.staff_users where id = auth.uid());
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_staff_account() and (select auth.jwt() ->> 'aal') = 'aal2';
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.staff_users where id = auth.uid() and role = 'super_admin'
  ) and (select auth.jwt() ->> 'aal') = 'aal2';
$$;

create or replace function public.is_admin_operativo_or_above()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.staff_users
    where id = auth.uid() and role in ('super_admin', 'admin_operativo')
  ) and (select auth.jwt() ->> 'aal') = 'aal2';
$$;

drop policy "staff_users_select_self_or_staff" on public.staff_users;
create policy "staff_users_select_self_or_staff" on public.staff_users
  for select using (public.is_staff_account());
