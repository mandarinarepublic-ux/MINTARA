import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularEnergia, detectarFrases } from "./frases.ts";

/** Construye una pista de energía: bloques de voz (alta) y silencio (baja). */
function pista(tramos: Array<{ ventanas: number; nivel: number }>): number[] {
  const salida: number[] = [];
  for (const t of tramos) for (let i = 0; i < t.ventanas; i++) salida.push(t.nivel);
  return salida;
}

const SEG_POR_VENTANA = 0.02; // ventanas de 20 ms

test("calcularEnergia promedia por ventana", () => {
  const muestras = new Float32Array([1, 1, 0, 0, -1, -1]);
  const energia = calcularEnergia(muestras, 2);
  assert.equal(energia.length, 3);
  assert.equal(energia[0], 1);
  assert.equal(energia[1], 0);
  assert.equal(energia[2], 1);
});

test("calcularEnergia descarta la ventana final incompleta", () => {
  const muestras = new Float32Array([1, 1, 1]);
  assert.equal(calcularEnergia(muestras, 2).length, 1);
});

test("separa dos frases con un silencio largo en medio", () => {
  const energia = pista([
    { ventanas: 50, nivel: 0.5 }, // 1 s de voz
    { ventanas: 30, nivel: 0.001 }, // 600 ms de silencio
    { ventanas: 50, nivel: 0.5 }, // 1 s de voz
  ]);
  const frases = detectarFrases(energia, SEG_POR_VENTANA);
  assert.equal(frases.length, 2);
});

test("no parte por una pausa corta de respiración", () => {
  const energia = pista([
    { ventanas: 50, nivel: 0.5 },
    { ventanas: 8, nivel: 0.001 }, // 160 ms: menos del silencio mínimo
    { ventanas: 50, nivel: 0.5 },
  ]);
  assert.equal(detectarFrases(energia, SEG_POR_VENTANA).length, 1);
});

test("descarta chasquidos más cortos que la frase mínima", () => {
  const energia = pista([
    { ventanas: 3, nivel: 0.5 }, // 60 ms: un ruidito
    { ventanas: 30, nivel: 0.001 },
    { ventanas: 50, nivel: 0.5 },
  ]);
  const frases = detectarFrases(energia, SEG_POR_VENTANA);
  assert.equal(frases.length, 1);
});

test("deja margen antes y después para no cortar la respiración", () => {
  const energia = pista([
    { ventanas: 25, nivel: 0.001 }, // 500 ms de silencio inicial
    { ventanas: 50, nivel: 0.5 },
    { ventanas: 25, nivel: 0.001 },
  ]);
  const [frase] = detectarFrases(energia, SEG_POR_VENTANA, { margenSeg: 0.06 });
  assert.ok(frase.inicio < 25 * SEG_POR_VENTANA, "debió adelantar el inicio");
  assert.ok(frase.inicio >= 0);
  assert.ok(frase.fin > 75 * SEG_POR_VENTANA, "debió atrasar el fin");
});

test("las frases salen ordenadas y sin solaparse", () => {
  const energia = pista([
    { ventanas: 40, nivel: 0.4 },
    { ventanas: 30, nivel: 0.001 },
    { ventanas: 40, nivel: 0.6 },
    { ventanas: 30, nivel: 0.001 },
    { ventanas: 40, nivel: 0.5 },
  ]);
  const frases = detectarFrases(energia, SEG_POR_VENTANA);
  assert.equal(frases.length, 3);
  for (let i = 1; i < frases.length; i++) {
    assert.ok(frases[i].inicio >= frases[i - 1].fin, "las frases se solapan");
  }
});

test("silencio total no devuelve ninguna frase", () => {
  const energia = pista([{ ventanas: 100, nivel: 0 }]);
  assert.deepEqual(detectarFrases(energia, SEG_POR_VENTANA), []);
});

test("el umbral es relativo: una grabación bajita también se corta bien", () => {
  const fuerte = pista([
    { ventanas: 50, nivel: 0.8 },
    { ventanas: 30, nivel: 0.002 },
    { ventanas: 50, nivel: 0.8 },
  ]);
  const bajita = pista([
    { ventanas: 50, nivel: 0.05 },
    { ventanas: 30, nivel: 0.0001 },
    { ventanas: 50, nivel: 0.05 },
  ]);
  assert.equal(detectarFrases(fuerte, SEG_POR_VENTANA).length, 2);
  assert.equal(detectarFrases(bajita, SEG_POR_VENTANA).length, 2);
});
