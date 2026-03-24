drop policy if exists "Authenticated can read barbershop" on public.barbershop;
create policy "Authenticated can read barbershop" on public.barbershop
for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can mutate barbershop" on public.barbershop;
create policy "Admins can mutate barbershop" on public.barbershop
for all using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
