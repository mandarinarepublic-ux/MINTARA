-- El plan pagado pasa a llamarse "premium", como en el diseño de Míntara.
update voz.perfiles set plan = 'premium' where plan = 'pago';

alter table voz.perfiles drop constraint perfiles_plan_check;
alter table voz.perfiles add constraint perfiles_plan_check
  check (plan in ('gratis', 'premium'));
