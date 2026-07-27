-- Los ambientes dejan de vivir en el código y pasan a la base, para poder
-- subirlos y editarlos desde el panel sin desplegar nada.

-- Quién puede administrar.
alter table voz.perfiles
  add column if not exists rol text not null default 'socio'
  check (rol in ('socio', 'admin'));

-- Familias: Lluvia, Río, Mar. Son lo que ve primero el cliente.
create table voz.familias (
  slug text primary key,
  nombre text not null,
  descripcion text not null,
  orden int not null default 0,
  activa boolean not null default true
);

-- Cada familia agrupa variantes: "lluvia suave", "lluvia con truenos"…
create table voz.ambientes (
  id uuid primary key default gen_random_uuid(),
  familia text not null references voz.familias(slug) on delete restrict,
  nombre text not null,
  ruta text not null,
  -- Qué ambientes puede usar quien no paga. Lo decide el admin, no el código.
  gratis boolean not null default false,
  activo boolean not null default true,
  orden int not null default 0,
  creado_en timestamptz not null default now()
);

create index ambientes_por_familia on voz.ambientes (familia, orden);

insert into voz.familias (slug, nombre, descripcion, orden) values
  ('lluvia', 'Lluvia', 'Para dormir y soltar el día', 1),
  ('rio',    'Río',    'Para concentrarte y avanzar', 2),
  ('mar',    'Mar',    'Para empezar la mañana', 3);

-- El fondo provisional que ya existe, para no dejar la app sin sonido.
insert into voz.ambientes (familia, nombre, ruta, gratis, orden)
values ('lluvia', 'Lluvia suave', 'provisional/lluvia.mp3', true, 1);

alter table voz.familias  enable row level security;
alter table voz.ambientes enable row level security;

-- Todo el mundo puede VER los ambientes: son el catálogo del producto.
create policy "familias visibles" on voz.familias
  for select using (true);
create policy "ambientes visibles" on voz.ambientes
  for select using (true);

-- Solo administradores los tocan.
create policy "familias las edita un admin" on voz.familias
  for all to authenticated
  using (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'))
  with check (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'));

create policy "ambientes los edita un admin" on voz.ambientes
  for all to authenticated
  using (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'))
  with check (exists (select 1 from voz.perfiles p where p.id = auth.uid() and p.rol = 'admin'));

grant select on voz.familias, voz.ambientes to anon, authenticated;
grant all on voz.familias, voz.ambientes to authenticated, service_role;
