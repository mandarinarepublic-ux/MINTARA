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
  gananciaVoz: 1,
  gananciaFondo: 0.35,
  pausaSeg: 2,
  entradaSeg: ENTRADA_FONDO,
  salidaSeg: SALIDA_FONDO,
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
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, gananciaVoz: -0.1 }));
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, gananciaVoz: 3 }));
});

test("la voz y el fondo llevan volúmenes independientes", () => {
  const plan = construirPlan(FRASES, {
    ...AJUSTES,
    gananciaVoz: 0.4,
    gananciaFondo: 0.8,
  });
  assert.equal(plan.gananciaVoz, 0.4);
  assert.equal(plan.fondo.ganancia, 0.8);
});

test("se puede dejar el ambiente por encima de la voz", () => {
  // El caso que pidió el usuario: oír más el río que su propia voz.
  const plan = construirPlan(FRASES, {
    ...AJUSTES,
    gananciaVoz: 0.3,
    gananciaFondo: 0.8,
  });
  assert.ok(plan.fondo.ganancia > plan.gananciaVoz);
});

test("bajar la voz a cero es válido: queda solo el ambiente", () => {
  const plan = construirPlan(FRASES, { ...AJUSTES, gananciaVoz: 0 });
  assert.equal(plan.gananciaVoz, 0);
  assert.equal(plan.voz.length, FRASES.length);
});

test("rechaza pausas negativas", () => {
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, pausaSeg: -1 }));
});

test("rechaza frases con fin anterior al inicio", () => {
  assert.throws(() => construirPlan([{ inicio: 5, fin: 2 }], AJUSTES));
});

// ---------------------------------------------------------------------
// Entrada y salida ajustables
// ---------------------------------------------------------------------

test("la voz espera a que termine de entrar el ambiente", () => {
  const plan = construirPlan(FRASES, { ...AJUSTES, entradaSeg: 6 });
  assert.equal(plan.voz[0].entraEn, 6);
  assert.equal(plan.fondo.entrada, 6);
});

test("una salida larga alarga la pieza, no corta la última frase", () => {
  const corta = construirPlan(FRASES, { ...AJUSTES, salidaSeg: 3 });
  const larga = construirPlan(FRASES, { ...AJUSTES, salidaSeg: 20 });

  const finDeLaVoz = (p: typeof corta) => {
    const u = p.voz[p.voz.length - 1];
    return u.entraEn + (u.hasta - u.desde);
  };

  // La voz termina en el mismo instante en las dos; lo que cambia es cuánto
  // sigue sonando el ambiente después.
  assert.equal(finDeLaVoz(corta), finDeLaVoz(larga));
  assert.equal(larga.duracionTotal - corta.duracionTotal, 17);
  assert.ok(larga.duracionTotal > finDeLaVoz(larga));
});

test("sin entrada ni salida, la voz arranca de inmediato", () => {
  const plan = construirPlan(FRASES, { ...AJUSTES, entradaSeg: 0, salidaSeg: 0 });
  assert.equal(plan.voz[0].entraEn, 0);
  assert.equal(plan.duracionTotal, 4 + 3 + 2 + 2 * 2);
});

test("rechaza entradas y salidas negativas o absurdas", () => {
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, entradaSeg: -1 }));
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, salidaSeg: -1 }));
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, entradaSeg: 61 }));
  assert.throws(() => construirPlan(FRASES, { ...AJUSTES, salidaSeg: 121 }));
});

test("los desvanecidos por defecto siguen siendo los de siempre", () => {
  assert.equal(ENTRADA_FONDO, 2);
  assert.equal(SALIDA_FONDO, 3);
});
