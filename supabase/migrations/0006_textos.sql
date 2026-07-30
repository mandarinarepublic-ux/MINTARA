-- Los textos de la app dejan de vivir solo en el código y pasan a la base,
-- para que se puedan cambiar desde el panel sin desplegar nada.
--
-- OJO: la base NO es la única fuente. En `src/lib/textos/catalogo.ts` queda
-- el texto original de cada clave, y lo que falte aquí sale de allá. Por eso
-- esta migración no inserta ni una fila: mientras nadie edite nada, la app se
-- ve exactamente igual que antes. Una fila aquí significa "alguien cambió
-- esto a propósito".

-- Textos sueltos de pantalla. La clave la define el catálogo del código.
--
-- Se llama `textos_pantalla` y no `textos` porque `voz.textos` YA EXISTE y es
-- otra cosa completamente distinta: ahí se guardan las afirmaciones que cada
-- persona escribe para grabar. Dos cosas muy distintas competían por el mismo
-- nombre obvio.
create table voz.textos_pantalla (
  clave text primary key,
  valor text not null,
  -- Una sola versión anterior, para el botón "volver a como estaba". Un
  -- historial completo sería otra tabla y otra pantalla para algo que casi
  -- nunca pasa.
  valor_anterior text,
  actualizado_en timestamptz not null default now()
);

-- Las afirmaciones sí necesitan estructura propia: se agregan, se quitan y
-- se reordenan, y eso una tabla clave-valor no lo modela bien.
create table voz.paquetes (
  id text primary key,
  nombre text not null,
  descripcion text not null,
  orden int not null default 0,
  activo boolean not null default true
);

create table voz.frases (
  id uuid primary key default gen_random_uuid(),
  paquete text not null references voz.paquetes(id) on delete cascade,
  texto text not null,
  orden int not null default 0
);

create index frases_por_paquete on voz.frases (paquete, orden);

alter table voz.textos_pantalla   enable row level security;
alter table voz.paquetes enable row level security;
alter table voz.frases   enable row level security;

-- Todo el mundo puede VER: son los textos del producto, se leen sin entrar.
create policy "textos de pantalla visibles" on voz.textos_pantalla
  for select using (true);
create policy "paquetes visibles" on voz.paquetes
  for select using (true);
create policy "frases visibles" on voz.frases
  for select using (true);

-- Solo administradores los tocan.
create policy "textos de pantalla los edita un admin" on voz.textos_pantalla
  for all to authenticated
  using (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'))
  with check (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'));

create policy "paquetes los edita un admin" on voz.paquetes
  for all to authenticated
  using (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'))
  with check (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'));

create policy "frases las edita un admin" on voz.frases
  for all to authenticated
  using (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'))
  with check (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'));

grant select on voz.textos_pantalla, voz.paquetes, voz.frases to anon, authenticated;
grant all on voz.textos_pantalla, voz.paquetes, voz.frases to authenticated, service_role;
