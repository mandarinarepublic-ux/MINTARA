import { test } from "node:test";
import assert from "node:assert/strict";
import { haceCuanto } from "./fechas.ts";

const AHORA = new Date("2026-07-26T15:00:00Z");

function hace(ms: number): Date {
  return new Date(AHORA.getTime() - ms);
}

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

test("lo recién hecho se dice recién", () => {
  assert.equal(haceCuanto(hace(20_000), AHORA), "recién");
  assert.equal(haceCuanto(hace(59_000), AHORA), "recién");
});

test("los minutos se cuentan hasta la hora", () => {
  assert.equal(haceCuanto(hace(5 * MINUTO), AHORA), "hace 5 min");
  assert.equal(haceCuanto(hace(59 * MINUTO), AHORA), "hace 59 min");
});

test("las horas se cuentan hasta el día", () => {
  assert.equal(haceCuanto(hace(2 * HORA), AHORA), "hace 2 h");
  assert.equal(haceCuanto(hace(23 * HORA), AHORA), "hace 23 h");
});

test("un solo día es ayer, no 'hace 1 día'", () => {
  assert.equal(haceCuanto(hace(DIA), AHORA), "ayer");
  assert.equal(haceCuanto(hace(1.5 * DIA), AHORA), "ayer");
});

test("los días se cuentan hasta la semana", () => {
  assert.equal(haceCuanto(hace(3 * DIA), AHORA), "hace 3 días");
  assert.equal(haceCuanto(hace(6 * DIA), AHORA), "hace 6 días");
});

test("más de una semana se dice en semanas", () => {
  assert.equal(haceCuanto(hace(8 * DIA), AHORA), "hace 1 semana");
  assert.equal(haceCuanto(hace(20 * DIA), AHORA), "hace 2 semanas");
});

test("más de un mes se dice en meses", () => {
  assert.equal(haceCuanto(hace(40 * DIA), AHORA), "hace 1 mes");
  assert.equal(haceCuanto(hace(100 * DIA), AHORA), "hace 3 meses");
});

test("una fecha futura por desfase de reloj no dice tonterías", () => {
  // El reloj del teléfono puede ir unos segundos adelantado respecto al
  // servidor; eso no debe mostrarse como "hace -1 min".
  assert.equal(haceCuanto(new Date(AHORA.getTime() + 30_000), AHORA), "recién");
});
