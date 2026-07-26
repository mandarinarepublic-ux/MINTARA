-- Sin esto, cualquier persona con la clave anónima podría leer las voces y
-- los textos de todas las demás. La clave anónima está en el navegador.
alter table voz.perfiles      enable row level security;
alter table voz.textos        enable row level security;
alter table voz.grabaciones   enable row level security;
alter table voz.ajustes_audio enable row level security;

create policy "cada quien ve su perfil" on voz.perfiles
  for select using (auth.uid() = id);
create policy "cada quien edita su perfil" on voz.perfiles
  for update using (auth.uid() = id);
create policy "cada quien crea su perfil" on voz.perfiles
  for insert with check (auth.uid() = id);
create policy "cada quien borra su perfil" on voz.perfiles
  for delete using (auth.uid() = id);

create policy "textos propios" on voz.textos
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "grabaciones propias" on voz.grabaciones
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "ajustes propios" on voz.ajustes_audio
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

-- PostgREST no expone un schema nuevo por sí solo: sin agregar `voz` a los
-- schemas expuestos, la API responde 406 "Invalid schema". Ya pasó con rrhh.
grant usage on schema voz to anon, authenticated, service_role;
grant all on all tables in schema voz to authenticated, service_role;
alter default privileges in schema voz
  grant all on tables to authenticated, service_role;
