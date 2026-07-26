import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularGananciaNormalizacion,
  rmsDe,
  RMS_OBJETIVO,
  GANANCIA_MAXIMA,
} from "./vozEstudio.ts";

/** Genera un tono de amplitud fija (basta para medir energía). */
function tono(amplitud: number, muestras = 4410): Float32Array {
  const salida = new Float32Array(muestras);
  for (let i = 0; i < muestras; i++) {
    salida[i] = Math.sin((i / 44100) * 2 * Math.PI * 220) * amplitud;
  }
  return salida;
}

test("una grabación bajita se sube", () => {
  const g = calcularGananciaNormalizacion(tono(0.02));
  assert.ok(g > 1, `esperaba amplificar, dio ${g}`);
});

test("una grabación pasada de volumen se baja", () => {
  const g = calcularGananciaNormalizacion(tono(0.9));
  assert.ok(g < 1, `esperaba atenuar, dio ${g}`);
});

test("aplicar la ganancia deja el volumen cerca del objetivo", () => {
  for (const amplitud of [0.02, 0.1, 0.5, 0.9]) {
    const muestras = tono(amplitud);
    const g = calcularGananciaNormalizacion(muestras);
    const rmsFinal = rmsDe(muestras) * g;
    assert.ok(
      Math.abs(rmsFinal - RMS_OBJETIVO) < 0.02,
      `con amplitud ${amplitud} quedó en ${rmsFinal}, lejos de ${RMS_OBJETIVO}`,
    );
  }
});

test("el silencio no se amplifica: sin tope, el ruido de fondo explotaría", () => {
  const silencio = new Float32Array(4410);
  assert.equal(calcularGananciaNormalizacion(silencio), 1);
});

test("hay un techo de amplificación", () => {
  // Una señal casi inaudible pediría multiplicar por cientos.
  const g = calcularGananciaNormalizacion(tono(0.0001));
  assert.ok(g <= GANANCIA_MAXIMA, `${g} pasó el techo de ${GANANCIA_MAXIMA}`);
});

test("rmsDe mide la energía real de la señal", () => {
  // Un tono de amplitud A tiene RMS = A / raíz(2).
  const medido = rmsDe(tono(0.5));
  assert.ok(Math.abs(medido - 0.5 / Math.SQRT2) < 0.01, `dio ${medido}`);
});
