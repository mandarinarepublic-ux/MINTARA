import { test } from "node:test";
import assert from "node:assert/strict";
import { codificarWav, leerEntero32, leerTexto } from "./wav.ts";

/** Un AudioBuffer de mentira: solo lo que el codificador realmente usa. */
function bufferFalso(muestras: Float32Array, hz = 44100) {
  return {
    numberOfChannels: 1,
    length: muestras.length,
    sampleRate: hz,
    getChannelData: () => muestras,
  } as unknown as AudioBuffer;
}

test("escribe una cabecera WAV válida", () => {
  const datos = codificarWav(bufferFalso(new Float32Array(100)));
  assert.equal(leerTexto(datos, 0, 4), "RIFF");
  assert.equal(leerTexto(datos, 8, 4), "WAVE");
  assert.equal(leerTexto(datos, 12, 4), "fmt ");
  assert.equal(leerTexto(datos, 36, 4), "data");
});

test("el tamaño declarado coincide con el real", () => {
  const muestras = new Float32Array(500);
  const datos = codificarWav(bufferFalso(muestras));
  // 44 de cabecera + 2 bytes por muestra (16 bits, mono).
  assert.equal(datos.byteLength, 44 + 500 * 2);
  assert.equal(leerEntero32(datos, 4), datos.byteLength - 8);
  assert.equal(leerEntero32(datos, 40), 500 * 2);
});

test("guarda la frecuencia de muestreo del audio original", () => {
  const datos = codificarWav(bufferFalso(new Float32Array(10), 48000));
  assert.equal(leerEntero32(datos, 24), 48000);
});

test("convierte la señal a enteros de 16 bits", () => {
  const datos = codificarWav(bufferFalso(new Float32Array([0, 1, -1])));
  const vista = new DataView(datos);
  assert.equal(vista.getInt16(44, true), 0);
  assert.equal(vista.getInt16(46, true), 32767);
  assert.equal(vista.getInt16(48, true), -32768);
});

test("recorta lo que se pase de rango en vez de dar la vuelta", () => {
  // Sin recorte, un valor de 1.5 desbordaría y sonaría como un chasquido
  // brutal en vez de saturar suave.
  const datos = codificarWav(bufferFalso(new Float32Array([1.5, -2])));
  const vista = new DataView(datos);
  assert.equal(vista.getInt16(44, true), 32767);
  assert.equal(vista.getInt16(46, true), -32768);
});
