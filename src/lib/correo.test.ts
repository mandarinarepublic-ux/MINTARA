import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarCorreo, ocultarCorreo } from "./correo.ts";

test("acepta un correo normal", () => {
  assert.equal(normalizarCorreo("rodrigo@gmail.com"), "rodrigo@gmail.com");
});

test("las mayúsculas y los espacios no crean una cuenta aparte", () => {
  // Sin esto, «Rodrigo@Gmail.com » y «rodrigo@gmail.com» serían dos personas
  // distintas, cada una con su biblioteca.
  assert.equal(normalizarCorreo("  Rodrigo@Gmail.COM  "), "rodrigo@gmail.com");
});

test("acepta las formas raras pero válidas que usa la gente", () => {
  assert.equal(normalizarCorreo("ana.maria+voz@mi-empresa.com.ec"), "ana.maria+voz@mi-empresa.com.ec");
  assert.equal(normalizarCorreo("j_perez99@correo.co"), "j_perez99@correo.co");
});

test("rechaza lo que no es un correo", () => {
  assert.equal(normalizarCorreo(""), null);
  assert.equal(normalizarCorreo("   "), null);
  assert.equal(normalizarCorreo("rodrigo"), null);
  assert.equal(normalizarCorreo("rodrigo@"), null);
  assert.equal(normalizarCorreo("@gmail.com"), null);
  assert.equal(normalizarCorreo("rodrigo@gmail"), null);
  assert.equal(normalizarCorreo("rodrigo@@gmail.com"), null);
  assert.equal(normalizarCorreo("rodri go@gmail.com"), null);
  assert.equal(normalizarCorreo("rodrigo@gmail..com"), null);
});

test("rechaza un celular escrito en la casilla del correo", () => {
  // Pasa cuando alguien se equivoca de pestaña.
  assert.equal(normalizarCorreo("0983745757"), null);
});

test("las tildes y la ñ no pasan", () => {
  // No son válidas en la parte de antes del arroba salvo casos exóticos, y
  // dejarlas pasar solo consigue que el código nunca llegue.
  assert.equal(normalizarCorreo("mariñо@gmail.com"), null);
  assert.equal(normalizarCorreo("josé@gmail.com"), null);
});

test("un correo larguísimo no pasa", () => {
  assert.equal(normalizarCorreo("a".repeat(250) + "@gmail.com"), null);
});

test("oculta el correo dejando reconocerlo", () => {
  assert.equal(ocultarCorreo("rodrigo@gmail.com"), "ro•••@gmail.com");
  assert.equal(ocultarCorreo("ab@gmail.com"), "••@gmail.com");
});
