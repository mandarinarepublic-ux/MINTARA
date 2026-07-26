import { test } from "node:test";
import assert from "node:assert/strict";
import { construirPlan, ENTRADA_FONDO, SALIDA_FONDO } from "./plan.ts";
import type { AjustesAudio, Frase } from "./plan.ts";

const FRASES: Frase[] = [
  { inicio: 0.0, fin: 4.0 }, // 4 s
  { inicio: 5.2, fin: 8.2 }, // 3 s
  { inicio: 9.0, fin: 11.0 }, // 2 s
];

const AJUSTES: AjustesAudio = {
  fondo: "lluvia",
  gananciaFondo: 0.35,
  pausaSeg: 2,
  orden: "original",
};

test("la voz no arranca en cero: el fondo entra primero", () => {
  const plan = construirPlan(FRASES, AJUSTES);
  assert.equal(plan.voz[0].entraEn, ENTRADA_FONDO);
});

test("respeta exactamente la pausa pedida entre frases", () => {
  const plan = construirPlan(FRASES, AJUSTES);
  for (let i = 1; i < plan.voz.length; i++) {
    const anterior = plan.voz[i - 1];
    const finAnterior = anterior.entraEn + (anterior.hasta - anterior.desde);
    assert.equal(
      Number((plan.voz[i].entraEn - finAnterior).toFixed(6)),
      AJUSTES.pausaSeg,
    );
  }
});

test("dos frases nunca se pisan", () => {
  const plan = construirPlan(FRASES, { ...AJUSTES, pausaSeg: 0 });
  for (let i = 1; i < plan.voz.length; i++) {
    const anterior = plan.voz[i - 1];
    const finAnterior = anterior.entraEn + (anterior.hasta - anterior.desde);
    assert.ok(
      plan.voz[i].entraEn >= finAnterior,
      `la frase ${i} se pisa con la anterior`,
    );
  }
});

test("la duración total cuadra: entrada + frases + pausas + salida", () => {
  const plan = construirPlan(FRASES, AJUSTES);
  const suma = 4 + 3 + 2;
  const pausas = AJUSTES.pausaSeg * (FRASES.length - 1);
  assert.equal(plan.duracionTotal, ENTRADA_FONDO + suma + pausas + SALIDA_FONDO);
});

test("cada bloque conserva el tramo exacto de la voz master", () => {
  const plan = construirPlan(FRASES, AJUSTES);
  plan.voz.forEach((b, i) => {
    assert.equal(b.desde, FRASES[i].inicio);
    assert.equal(b.hasta, FRASES[i].fin);
  });
});

test("el fondo usa la pista, la ganancia y los desvanecidos pedidos", () => {
  const plan = construirPlan(FRASES, AJUSTES);
  assert.equal(plan.fondo.pista, "lluvia");
  assert.equal(plan.fondo.ganancia, 0.35);
  assert.equal(plan.fondo.entrada, ENTRADA_FONDO);
  assert.equal(plan.fondo.salida, SALIDA_FONDO);
});

test("con orden barajado usa la permutación recibida", () => {
  const plan = construirPlan(FRASES, { ...AJUSTES, orden: "barajado" }, [2, 0, 1]);
  assert.deepEqual(
    plan.voz.map((b) => b.frase),
    [2, 0, 1],
  );
  assert.equal(plan.voz[0].desde, 9.0);
});

test("una sola frase no genera pausas", () => {
  const plan = construirPlan([{ inicio: 1, fin: 3 }], AJUSTES);
  assert.equal(plan.voz.length, 1);
  assert.equal(plan.duracionTotal, ENTRADA_FONDO + 2 + SALIDA_FONDO);
});

test("sin frases devuelve un plan vacío pero válido", () => {
  const plan = construirPlan([], AJUSTES);
  assert.deepEqual(plan.voz, []);
  assert.equal(plan.duracionTotal, ENTRADA_FONDO + SALIDA_FONDO);
});

test("rechaza ganancias fuera de rango", () => {
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, gananciaFondo: 1.5 }));
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, gananciaFondo: -0.1 }));
});

test("rechaza pausas negativas", () => {
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, pausaSeg: -1 }));
});

test("rechaza frases con fin anterior al inicio", () => {
  assert.throws(() => construirPlan([{ inicio: 5, fin: 2 }], AJUSTES));
});
