-- Amplia public.tickets (el sistema de tickets del portal de clientes, el
-- unico que ya tiene chat + adjuntos conectados) al Service Desk que pide el
-- PDF: 7 estados, 4 prioridades (renombra 'urgente' -> 'critica'), asignacion
-- a staff, SLA, escalamiento, y notas internas (staff-only) en el chat.
--
-- Deliberadamente NO se toca public.support_tickets: es un sistema aparte,
-- alimentado por el formulario publico anonimo de /soporte, sin client_id ni
-- relacion con clientes reales — unificarlo con tickets es una decision de
-- arquitectura mas grande que el PDF no pide explicitamente.

-- ---------------------------------------------------------------------------
-- 1) Prioridad: migrar datos ANTES de cambiar el constraint.
-- ---------------------------------------------------------------------------

alter table public.tickets drop constraint tickets_priority_check;
update public.tickets set priority = 'critica' where priority = 'urgente';
alter table public.tickets
  add constraint tickets_priority_check
  check (priority in ('baja', 'media', 'alta', 'critica'));

-- ---------------------------------------------------------------------------
-- 2) Estado: de 3 a 7 valores. Los 3 valores existentes (abierto/en_progreso/
--    resuelto) siguen siendo validos, solo se agregan los 4 nuevos.
-- ---------------------------------------------------------------------------

alter table public.tickets drop constraint tickets_status_check;
alter table public.tickets
  add constraint tickets_status_check
  check (status in (
    'abierto', 'en_revision', 'asignado', 'en_progreso',
    'pendiente_cliente', 'resuelto', 'cerrado'
  ));

-- ---------------------------------------------------------------------------
-- 3) Asignacion, SLA y escalamiento.
-- ---------------------------------------------------------------------------

alter table public.tickets add column assigned_to uuid references public.staff_users(id) on delete set null;
alter table public.tickets add column sla_due_at timestamptz;
alter table public.tickets add column first_response_at timestamptz;
alter table public.tickets add column escalated boolean not null default false;
alter table public.tickets add column escalated_at timestamptz;

create or replace function public.set_ticket_sla_due_at()
returns trigger
language plpgsql
as $$
begin
  if new.sla_due_at is null then
    new.sla_due_at := new.created_at + case new.priority
      when 'critica' then interval '4 hours'
      when 'alta' then interval '24 hours'
      when 'media' then interval '48 hours'
      else interval '72 hours'
    end;
  end if;
  return new;
end;
$$;

create trigger trg_tickets_set_sla_due_at
  before insert on public.tickets
  for each row execute function public.set_ticket_sla_due_at();

-- Backfill de SLA para tickets ya existentes (por prioridad, desde su fecha de creacion).
update public.tickets set sla_due_at = created_at + case priority
  when 'critica' then interval '4 hours'
  when 'alta' then interval '24 hours'
  when 'media' then interval '48 hours'
  else interval '72 hours'
end
where sla_due_at is null;

-- ---------------------------------------------------------------------------
-- 4) Chat interno: ticket_messages gana is_internal. Los clientes nunca deben
--    ver ni crear mensajes internos — se ajustan las 2 policies de cliente de
--    0003_full_client_portal_schema.sql; la policy de staff (staff_all_ticket_messages,
--    "for all") no cambia, el staff ya podia leer/escribir cualquier mensaje.
-- ---------------------------------------------------------------------------

alter table public.ticket_messages add column is_internal boolean not null default false;

-- author_id solo referencia client_users — el staff no puede ser "autor" con el
-- esquema actual. Se agrega una columna paralela para mensajes de staff; el
-- codigo de aplicacion garantiza que un mensaje nuevo setea author_id O
-- staff_author_id, nunca ambos. El check solo prohibe el caso sin sentido de
-- tener AMBOS a la vez — no exige que al menos uno este presente, porque
-- author_id ya es "on delete set null" (mensajes de un client_user borrado
-- quedan legitimamente con author_id null y deben poder seguir existiendo).
alter table public.ticket_messages add column staff_author_id uuid references public.staff_users(id) on delete set null;
alter table public.ticket_messages add constraint ticket_messages_single_author_check
  check (not (author_id is not null and staff_author_id is not null));

drop policy "ticket_messages_select_own_client" on public.ticket_messages;
create policy "ticket_messages_select_own_client" on public.ticket_messages
  for select to authenticated
  using (
    is_internal = false
    and ticket_id in (select id from public.tickets where client_id = public.current_client_id())
  );

drop policy "ticket_messages_insert_own_client" on public.ticket_messages;
create policy "ticket_messages_insert_own_client" on public.ticket_messages
  for insert to authenticated
  with check (
    is_internal = false
    and staff_author_id is null
    and ticket_id in (select id from public.tickets where client_id = public.current_client_id())
  );
