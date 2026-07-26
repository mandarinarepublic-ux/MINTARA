import { test } from "node:test";
import assert from "node:assert/strict";
import {
  puedeGrabar,
  fondosPermitidos,
  puedeUsarSinInternet,
  duracionMaximaSeg,
  PRECIOS,
  LIMITES,
} from "./planes.ts";
import { FONDOS } from "./audio/fondos.ts";

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

test("gratis solo tiene lluvia; premium los tres ambientes", () => {
  assert.deepEqual(fondosPermitidos("gratis"), ["lluvia"]);
  assert.deepEqual(fondosPermitidos("premium"), ["lluvia", "rio", "mar"]);
});

test("el modo sin internet es solo de premium", () => {
  assert.equal(puedeUsarSinInternet("gratis"), false);
  assert.equal(puedeUsarSinInternet("premium"), true);
});

test("todo fondo permitido existe en el catálogo", () => {
  const catalogo = new Set(FONDOS.map((f) => f.id));
  for (const plan of ["gratis", "premium"] as const) {
    for (const id of fondosPermitidos(plan)) {
      assert.ok(catalogo.has(id), `el plan ${plan} permite "${id}", que no existe`);
    }
  }
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
