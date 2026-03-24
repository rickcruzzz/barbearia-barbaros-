insert into public.barbershop (name, address, phone, whatsapp, instagram, working_hours_json)
values (
  'Bárbaros Barbershop',
  'Stella Maris, Salvador/BA',
  '(71) 98354-2132',
  '5571983542132',
  'https://instagram.com/barbarosbarber1',
  '{"monday":"09:00-19:00","tuesday":"09:00-19:00","wednesday":"09:00-19:00","thursday":"09:00-19:00","friday":"09:00-19:00","saturday":"09:00-17:00"}'::jsonb
)
on conflict do nothing;

insert into public.barbers (name, email, role, commission_pct, is_active)
values
  ('Rafael', 'rafael@barbaros.com', 'admin', 45, true),
  ('Thiago', 'thiago@barbaros.com', 'barbeiro', 40, true)
on conflict (email) do nothing;

insert into public.services (name, description, price, duration_minutes, is_active)
values
  ('Corte Clássico', 'Corte social com acabamento', 55, 40, true),
  ('Barba na Régua', 'Modelagem e alinhamento na navalha', 40, 30, true),
  ('Combo Corte + Barba', 'Atendimento completo', 85, 60, true)
on conflict do nothing;

-- Após criar usuários no Supabase Auth, vincule o papel de cada usuário:
-- insert into public.user_roles (user_id, role) values
--   ('UUID_DO_USUARIO_ADMIN', 'admin'),
--   ('UUID_DO_USUARIO_BARBEIRO', 'barbeiro')
-- on conflict (user_id) do update set role = excluded.role;

-- Observacao:
-- para o agendamento publico validar disponibilidade, aplique tambem a migration
-- 003_public_appointments_availability.sql no Supabase.
-- e para permitir cadastro publico de cliente sem SELECT, aplique a migration
-- 004_public_clients_insert_grant.sql.
-- para auditoria de alteracoes de agendamento no painel, aplique tambem
-- 005_appointments_audit_logs.sql.
-- para upload profissional de foto de barbeiros via storage, aplique tambem
-- 007_storage_barber_photos.sql.
-- para checks de consistencia e indices de agendamento, aplique tambem
-- 008_booking_constraints.sql.
