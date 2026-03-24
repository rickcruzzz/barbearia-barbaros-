create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'barbeiro')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create policy if not exists "Users can read own role" on public.user_roles
for select using (auth.uid() = user_id);

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role from public.user_roles where user_id = auth.uid()
$$;

drop policy if exists "Admins can mutate barbers" on public.barbers;
drop policy if exists "Admins can mutate services" on public.services;
drop policy if exists "Admins can mutate clients" on public.clients;
drop policy if exists "Admins can mutate appointments" on public.appointments;
drop policy if exists "Admins can mutate blocked days" on public.blocked_days;

create policy if not exists "Admins can mutate barbers only" on public.barbers
for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy if not exists "Admins can mutate services only" on public.services
for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy if not exists "Admins can mutate clients only" on public.clients
for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy if not exists "Admins can mutate blocked days only" on public.blocked_days
for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "Authenticated can read services" on public.services;
create policy if not exists "Public can read active services" on public.services
for select using (is_active = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated can read barbers" on public.barbers;
create policy if not exists "Public can read active barbers" on public.barbers
for select using (is_active = true or auth.role() = 'authenticated');

create policy if not exists "Public can create clients" on public.clients
for insert with check (true);

create policy if not exists "Public can create pending appointments" on public.appointments
for insert with check (
  status = 'pending'
  and payment_method is null
  and amount_paid is null
);
