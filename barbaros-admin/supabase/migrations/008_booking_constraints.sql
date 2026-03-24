alter table public.appointments
  drop constraint if exists appointments_start_before_end_chk;

alter table public.appointments
  add constraint appointments_start_before_end_chk
  check (start_time < end_time);

create index if not exists idx_appointments_status_date on public.appointments(status, date);
create index if not exists idx_appointments_barber_date on public.appointments(barber_id, date);
