import { test } from "node:test";
import assert from "node:assert/strict";
import {
  moverFrase,
  quitarFrase,
  frasesUtiles,
  puedeApagarse,
  idDesdeNombre,
} from "./edicion.ts";

test("subir una frase la intercambia con la de arriba", () => {
  assert.deepEqual(moverFrase(["a", "b", "c"], 1, -1), ["b", "a", "c"]);
});

test("bajar una frase la intercambia con la de abajo", () => {
  assert.deepEqual(moverFrase(["a", "b", "c"], 1, 1), ["a", "c", "b"]);
});

test("no se puede subir la primera ni bajar la última", () => {
  assert.deepEqual(moverFrase(["a", "b"], 0, -1), ["a", "b"]);
  assert.deepEqual(moverFrase(["a", "b"], 1, 1), ["a", "b"]);
});

test("mover no toca la lista original", () => {
  const original = ["a", "b"];
  moverFrase(original, 0, 1);
  assert.deepEqual(original, ["a", "b"]);
});

test("quitar saca solo la que se pidió", () => {
  assert.deepEqual(quitarFrase(["a", "b", "c"], 1), ["a", "c"]);
});

test("las frases en blanco no cuentan", () => {
  assert.deepEqual(frasesUtiles(["Hola", "  ", "", "Chao"]), ["Hola", "Chao"]);
});

test("una lista que solo tiene espacios se considera vacía", () => {
  // Es el freno: guardar así dejaría un botón que al tocarlo no ofrece nada.
  assert.equal(frasesUtiles(["   ", ""]).length, 0);
});

test("la última lista encendida no se puede apagar", () => {
  assert.equal(puedeApagarse(["calma"], "calma"), false);
});

test("apagar una lista se permite si queda alguna encendida", () => {
  assert.equal(puedeApagarse(["calma", "dormir"], "calma"), true);
});

test("apagar una que ya estaba apagada no se bloquea", () => {
  assert.equal(puedeApagarse(["calma"], "otra"), true);
});

test("el nombre se vuelve un id sin tildes ni espacios", () => {
  assert.equal(idDesdeNombre("Empezar el día"), "empezar-el-dia");
  assert.equal(idDesdeNombre("  Gratitud  "), "gratitud");
  assert.equal(idDesdeNombre("Ánimo & Fuerza"), "animo-fuerza");
});

test("un nombre que no deja ni una letra no devuelve un id vacío", () => {
  assert.ok(idDesdeNombre("¿?¡!").length > 0);
});
