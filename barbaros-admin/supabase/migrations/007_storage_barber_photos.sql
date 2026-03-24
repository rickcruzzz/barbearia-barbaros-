insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'barber-photos',
  'barber-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read barber photos" on storage.objects;
create policy "Public can read barber photos" on storage.objects
for select
using (bucket_id = 'barber-photos');

drop policy if exists "Admins can upload barber photos" on storage.objects;
create policy "Admins can upload barber photos" on storage.objects
for insert
with check (bucket_id = 'barber-photos' and public.current_user_role() = 'admin');

drop policy if exists "Admins can update barber photos" on storage.objects;
create policy "Admins can update barber photos" on storage.objects
for update
using (bucket_id = 'barber-photos' and public.current_user_role() = 'admin')
with check (bucket_id = 'barber-photos' and public.current_user_role() = 'admin');

drop policy if exists "Admins can delete barber photos" on storage.objects;
create policy "Admins can delete barber photos" on storage.objects
for delete
using (bucket_id = 'barber-photos' and public.current_user_role() = 'admin');
