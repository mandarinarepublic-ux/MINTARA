-- Schema propio dentro de mandarina-DATA, junto a crm, inbox, mata y rrhh.
create schema if not exists voz;

-- Perfil de la persona. El id es el mismo de auth.users: el login (celular
-- + código por WhatsApp) es el que ya existe en este proyecto.
create table voz.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  celular text not null,
  plan text not null default 'gratis' check (plan in ('gratis', 'pago')),
  consentimiento_en timestamptz,
  creado_en timestamptz not null default now()
);

-- El texto que la persona va a leer. Puede venir de un paquete y luego
-- editarse; se guarda el resultado final, no la referencia al paquete.
create table voz.textos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references voz.perfiles(id) on delete cascade,
  nombre text not null,
  frases text[] not null check (array_length(frases, 1) between 1 and 12),
  creado_en timestamptz not null default now()
);

-- Una grabación = una lectura + su pulido. Es el activo caro: se paga una
-- sola vez y de ella salen todos los audios que la persona arme después.
create table voz.grabaciones (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references voz.perfiles(id) on delete cascade,
  texto_id uuid not null references voz.textos(id) on delete cascade,
  estado text not null default 'cruda'
    check (estado in ('cruda', 'puliendo', 'lista', 'fallida')),
  ruta_cruda text,
  ruta_master text,
  duracion_seg numeric,
  cortes jsonb,
  error text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index grabaciones_por_perfil on voz.grabaciones (perfil_id, creado_en desc);

-- Configuraciones guardadas: fondo, volumen y pausas. Livianas a propósito
-- (no guardan audio), por eso pueden ser ilimitadas incluso en el plan gratis.
create table voz.ajustes_audio (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references voz.perfiles(id) on delete cascade,
  grabacion_id uuid not null references voz.grabaciones(id) on delete cascade,
  nombre text not null,
  fondo text not null,
  ganancia_fondo numeric not null check (ganancia_fondo between 0 and 1),
  pausa_seg numeric not null check (pausa_seg >= 0),
  orden text not null default 'original' check (orden in ('original', 'barajado')),
  creado_en timestamptz not null default now()
);
