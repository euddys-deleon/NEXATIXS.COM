-- Gestion de licencias/servicios del PDF de mejoras.
--
-- "licenses" ya modela lo que el PDF llama "servicios" en la ficha de cada
-- cliente (SIEM, SOC, Hosting, etc. via el campo category) y "licencias" de
-- software indistintamente — no hay dos tablas separadas, category ya cumple
-- ese rol. Lo que falta para cubrir el pedido "Agregar/Reducir/Renovar/
-- Transferir" es: cantidad (seats) y a que usuario del cliente esta asignada.
--
-- public.services_catalog es una tabla DISTINTA y global (no por cliente):
-- el catalogo de servicios ofrecidos por NEXATIXS que alimenta las
-- sugerencias de upsell. El CRUD de ese catalogo (crear/editar/eliminar
-- servicio) se implementa en el admin sin cambios de esquema — ya tiene
-- RLS admin_operativo_or_above desde 0021_rbac_three_roles.sql.

alter table public.licenses add column if not exists seats integer not null default 1 check (seats >= 0);
alter table public.licenses add column if not exists assigned_to uuid references public.client_users(id) on delete set null;
