import { test } from "node:test";
import assert from "node:assert/strict";
import {
  puedeGrabar,
  fondosPermitidos,
  puedeUsarSinInternet,
  LIMITES,
} from "./planes.ts";
import { FONDOS } from "./audio/fondos.ts";

test("el plan gratis permite una sola grabación", () => {
  assert.equal(puedeGrabar("gratis", 0), true);
  assert.equal(puedeGrabar("gratis", 1), false);
  assert.equal(puedeGrabar("gratis", 5), false);
});

test("el plan pago permite varias, hasta el tope", () => {
  assert.equal(puedeGrabar("pago", 0), true);
  assert.equal(puedeGrabar("pago", LIMITES.pago.grabaciones - 1), true);
  assert.equal(puedeGrabar("pago", LIMITES.pago.grabaciones), false);
});

test("el plan gratis solo tiene dos fondos", () => {
  assert.deepEqual(fondosPermitidos("gratis"), ["lluvia", "rio"]);
  assert.equal(fondosPermitidos("pago").length, 5);
});

test("el modo sin internet es solo del plan pago", () => {
  assert.equal(puedeUsarSinInternet("gratis"), false);
  assert.equal(puedeUsarSinInternet("pago"), true);
});

test("todo fondo permitido existe en el catálogo", () => {
  const catalogo = new Set(FONDOS.map((f) => f.id));
  for (const plan of ["gratis", "pago"] as const) {
    for (const id of fondosPermitidos(plan)) {
      assert.ok(catalogo.has(id), `el plan ${plan} permite "${id}", que no existe`);
    }
  }
});
