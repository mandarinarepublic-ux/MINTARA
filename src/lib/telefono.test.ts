import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarCelular, ocultarCelular } from "./telefono.ts";

test("acepta las formas en que la gente escribe su celular en Ecuador", () => {
  for (const entrada of [
    "0983745757",
    "983745757",
    "+593983745757",
    "593983745757",
    "098 374 5757",
  ]) {
    assert.equal(normalizarCelular(entrada), "+593983745757", `falló con ${entrada}`);
  }
});

test("rechaza lo que no es un celular ecuatoriano", () => {
  for (const entrada of ["12345", "022345678", "", "abcdefghij", "09837457570"]) {
    assert.equal(normalizarCelular(entrada), null, `no debió aceptar ${entrada}`);
  }
});

test("oculta el número dejando solo los últimos dígitos", () => {
  assert.equal(ocultarCelular("+593983745757"), "••••• 5757");
});
