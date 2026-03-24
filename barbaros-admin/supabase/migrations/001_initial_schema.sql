create extension if not exists "pgcrypto";

create table if not exists public.barbershop (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text not null,
  whatsapp text not null,
  instagram text,
  working_hours_json jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'barbeiro')),
  photo_url text,
  commission_pct numeric(5,2) not null default 40.00,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  duration_minutes integer not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  barber_id uuid not null references public.barbers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  payment_method text,
  amount_paid numeric(10,2),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.blocked_days (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (barber_id, date)
);

create index if not exists idx_appointments_date on public.appointments(date);
create index if not exists idx_appointments_barber on public.appointments(barber_id);
create index if not exists idx_appointments_client on public.appointments(client_id);

alter table public.barbershop enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.blocked_days enable row level security;

create policy if not exists "Authenticated can read barbershop" on public.barbershop
for select using (auth.role() = 'authenticated');

create policy if not exists "Authenticated can read barbers" on public.barbers
for select using (auth.role() = 'authenticated');

create policy if not exists "Authenticated can read services" on public.services
for select using (auth.role() = 'authenticated');

create policy if not exists "Authenticated can read clients" on public.clients
for select using (auth.role() = 'authenticated');

create policy if not exists "Authenticated can read appointments" on public.appointments
for select using (auth.role() = 'authenticated');

create policy if not exists "Authenticated can read blocked days" on public.blocked_days
for select using (auth.role() = 'authenticated');

create policy if not exists "Admins can mutate barbers" on public.barbers
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Admins can mutate services" on public.services
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Admins can mutate clients" on public.clients
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Admins can mutate appointments" on public.appointments
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Admins can mutate blocked days" on public.blocked_days
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
