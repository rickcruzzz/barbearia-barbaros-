-- Permite leitura publica minima para validar disponibilidade no agendamento online.
-- Mantem o escopo apenas para horarios ocupados (pending/confirmed).
create policy if not exists "Public can read appointment availability" on public.appointments
for select
using (status in ('pending', 'confirmed'));

-- Reduz superficie de exposicao para usuarios anonimos:
-- anon so pode ler colunas necessarias para disponibilidade.
revoke all on public.appointments from anon;
grant select (date, barber_id, start_time, end_time, status) on public.appointments to anon;
grant insert (client_id, barber_id, service_id, date, start_time, end_time, status, notes, payment_method, amount_paid) on public.appointments to anon;
