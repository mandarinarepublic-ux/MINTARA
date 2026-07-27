import { test } from "node:test";
import assert from "node:assert/strict";
import {
  puedeGrabar,
  puedeUsarSinInternet,
  duracionMaximaSeg,
  planEfectivo,
  PRECIOS,
  LIMITES,
} from "./planes.ts";

test("el plan gratis permite un solo audio", () => {
  assert.equal(puedeGrabar("gratis", 0), true);
  assert.equal(puedeGrabar("gratis", 1), false);
});

test("premium permite muchos audios", () => {
  assert.equal(puedeGrabar("premium", 0), true);
  assert.equal(puedeGrabar("premium", 50), true);
});

test("gratis graba hasta un minuto; premium hasta diez", () => {
  assert.equal(duracionMaximaSeg("gratis"), 60);
  assert.equal(duracionMaximaSeg("premium"), 600);
});

test("quien administra nunca topa con los límites", () => {
  assert.equal(planEfectivo("gratis", "admin"), "premium");
  assert.equal(puedeGrabar(planEfectivo("gratis", "admin"), 30), true);
});

test("a quien no administra no se le regala premium", () => {
  assert.equal(planEfectivo("gratis", "socio"), "gratis");
  assert.equal(planEfectivo("gratis", null), "gratis");
  assert.equal(planEfectivo("gratis", undefined), "gratis");
  assert.equal(planEfectivo("premium", "socio"), "premium");
});

test("el modo sin internet es solo de premium", () => {
  assert.equal(puedeUsarSinInternet("gratis"), false);
  assert.equal(puedeUsarSinInternet("premium"), true);
});

test("los precios viven en configuración, no incrustados en las pantallas", () => {
  assert.equal(PRECIOS.mensual.monto, 6.99);
  assert.equal(PRECIOS.anual.monto, 49.99);
  assert.equal(PRECIOS.mensual.moneda, "USD");
});

test("el año cuesta menos que doce meses sueltos", () => {
  assert.ok(PRECIOS.anual.monto < PRECIOS.mensual.monto * 12);
});

test("el plan gratis no queda con límites de premium por descuido", () => {
  assert.ok(LIMITES.gratis.audios < LIMITES.premium.audios);
  assert.ok(LIMITES.gratis.segundos < LIMITES.premium.segundos);
});
