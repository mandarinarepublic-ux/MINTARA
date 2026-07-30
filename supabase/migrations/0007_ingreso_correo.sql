-- Entrar también con correo, no solo con el celular.
--
-- `celular` era obligatorio, así que quien entrara por correo no podía tener
-- perfil: el alta fallaba y la persona quedaba dentro de la sesión pero sin
-- existir para la app (sin plan, sin consentimiento, sin nada).

alter table voz.perfiles
  alter column celular drop not null;

alter table voz.perfiles
  add column if not exists correo text;

-- Un perfil sin celular NI correo no tendría ninguna forma de volver a entrar
-- ni de que lo contactemos. La regla la pone la base y no el código, para que
-- no haya ningún camino —ni un bug, ni una migración futura— que pueda crear
-- uno así.
alter table voz.perfiles
  add constraint perfiles_al_menos_una_forma_de_entrar
  check (celular is not null or correo is not null);

-- Dos personas no pueden compartir correo: sería la puerta a entrar en la
-- cuenta ajena. Parcial, porque los nulos no compiten entre sí.
create unique index if not exists perfiles_correo_unico
  on voz.perfiles (correo)
  where correo is not null;
