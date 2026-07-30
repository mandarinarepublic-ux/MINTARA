import { test } from "node:test";
import assert from "node:assert/strict";
import { formasDeEntrar, hayCorreo } from "./ingreso.ts";

test("apagado, la pantalla se ve exactamente como hoy", () => {
  // Esto es lo que impide que salga a producción a medias: sin SMTP
  // configurado, Supabase rechaza a cualquiera que no sea del equipo y la
  // persona se queda afuera sin entender por qué.
  assert.deepEqual(formasDeEntrar({}), ["celular"]);
  assert.deepEqual(formasDeEntrar({ INGRESO_POR_CORREO: "" }), ["celular"]);
  assert.deepEqual(formasDeEntrar({ INGRESO_POR_CORREO: "   " }), ["celular"]);
  assert.deepEqual(formasDeEntrar({ INGRESO_POR_CORREO: "0" }), ["celular"]);
  assert.deepEqual(formasDeEntrar({ INGRESO_POR_CORREO: "false" }), ["celular"]);
});

test("encendido, aparece el correo y el celular sigue primero", () => {
  // El celular va primero a propósito: es lo que ya usa la gente.
  assert.deepEqual(formasDeEntrar({ INGRESO_POR_CORREO: "1" }), [
    "celular",
    "correo",
  ]);
  assert.deepEqual(formasDeEntrar({ INGRESO_POR_CORREO: "si" }), [
    "celular",
    "correo",
  ]);
  assert.deepEqual(formasDeEntrar({ INGRESO_POR_CORREO: "true" }), [
    "celular",
    "correo",
  ]);
});

test("el BOM invisible de PowerShell no apaga la función sin querer", () => {
  // Ya pasó antes con otras variables cargadas desde PowerShell.
  assert.deepEqual(formasDeEntrar({ INGRESO_POR_CORREO: "﻿1" }), [
    "celular",
    "correo",
  ]);
});

test("hayCorreo responde lo mismo que la lista", () => {
  assert.equal(hayCorreo({}), false);
  assert.equal(hayCorreo({ INGRESO_POR_CORREO: "1" }), true);
});
