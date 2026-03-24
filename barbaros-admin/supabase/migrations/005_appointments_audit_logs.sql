create table if not exists public.appointment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  action text not null,
  old_status text check (old_status in ('pending', 'confirmed', 'completed', 'cancelled')),
  new_status text check (new_status in ('pending', 'confirmed', 'completed', 'cancelled')),
  actor_user_id uuid,
  actor_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointment_audit_logs_appointment on public.appointment_audit_logs(appointment_id);
create index if not exists idx_appointment_audit_logs_created_at on public.appointment_audit_logs(created_at desc);

alter table public.appointment_audit_logs enable row level security;

drop policy if exists "Authenticated can read audit logs" on public.appointment_audit_logs;
create policy "Authenticated can read audit logs" on public.appointment_audit_logs
for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can insert audit logs" on public.appointment_audit_logs;
create policy "Admins can insert audit logs" on public.appointment_audit_logs
for insert with check (public.current_user_role() = 'admin');
