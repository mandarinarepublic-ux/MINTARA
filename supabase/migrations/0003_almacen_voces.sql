-- Bucket PRIVADO. Nada de public: la voz de una persona no se sirve por una
-- dirección adivinable. Cada reproducción pide una URL firmada de corta vida.
insert into storage.buckets (id, name, public)
values ('voces', 'voces', false)
on conflict (id) do nothing;

-- Cada persona solo toca su propia carpeta: voces/<su uuid>/...
-- Los nombres llevan el prefijo "voz " para no chocar con las políticas de
-- storage que ya usan el CRM y los inbox en este mismo proyecto.
create policy "voz sube a su carpeta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'voces' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "voz lee su carpeta" on storage.objects
  for select to authenticated
  using (bucket_id = 'voces' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "voz borra su carpeta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'voces' and (storage.foldername(name))[1] = auth.uid()::text);
