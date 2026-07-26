import type { Frase } from "./plan.ts";

/**
 * Corte de la voz master en frases.
 *
 * Corre en el navegador después del pulido, cuando el audio ya viene limpio
 * y los silencios son silencios de verdad. Recibe números y devuelve
 * números, así que se puede probar sin reproducir nada.
 *
 * El umbral es RELATIVO al pico de la propia grabación. Un umbral fijo
 * funcionaría solo con quien graba fuerte; quien habla bajito quedaría como
 * silencio de punta a punta.
 */

export type OpcionesCorte = {
  /** Silencio mínimo para considerar que terminó una frase. */
  silencioMinSeg?: number;
  /** Duración mínima para que un tramo con sonido cuente como frase. */
  fraseMinSeg?: number;
  /** Colchón que se agrega antes y después de cada frase. */
  margenSeg?: number;
  /** Fracción del pico por debajo de la cual se considera silencio. */
  umbralRelativo?: number;
};

export function calcularEnergia(
  muestras: Float32Array,
  muestrasPorVentana: number,
): number[] {
  const ventanas: number[] = [];
  const total = Math.floor(muestras.length / muestrasPorVentana);
  for (let v = 0; v < total; v++) {
    let suma = 0;
    const desde = v * muestrasPorVentana;
    for (let i = desde; i < desde + muestrasPorVentana; i++) {
      suma += muestras[i] * muestras[i];
    }
    ventanas.push(Math.sqrt(suma / muestrasPorVentana));
  }
  return ventanas;
}

export function detectarFrases(
  energia: number[],
  segPorVentana: number,
  opciones: OpcionesCorte = {},
): Frase[] {
  const silencioMin = opciones.silencioMinSeg ?? 0.35;
  const fraseMin = opciones.fraseMinSeg ?? 0.3;
  const margen = opciones.margenSeg ?? 0.06;
  const umbralRelativo = opciones.umbralRelativo ?? 0.08;

  const pico = Math.max(...energia, 0);
  if (pico <= 0) return [];
  const umbral = pico * umbralRelativo;

  const ventanasSilencio = Math.ceil(silencioMin / segPorVentana);

  const crudas: Array<{ desde: number; hasta: number }> = [];
  let inicio: number | null = null;
  let silencioSeguido = 0;

  energia.forEach((valor, i) => {
    if (valor > umbral) {
      if (inicio === null) inicio = i;
      silencioSeguido = 0;
    } else if (inicio !== null) {
      silencioSeguido++;
      if (silencioSeguido >= ventanasSilencio) {
        crudas.push({ desde: inicio, hasta: i - silencioSeguido + 1 });
        inicio = null;
        silencioSeguido = 0;
      }
    }
  });
  if (inicio !== null) {
    crudas.push({ desde: inicio, hasta: energia.length });
  }

  const finPista = energia.length * segPorVentana;

  return crudas
    .filter((t) => (t.hasta - t.desde) * segPorVentana >= fraseMin)
    .map((t) => ({
      inicio: Math.max(0, t.desde * segPorVentana - margen),
      fin: Math.min(finPista, t.hasta * segPorVentana + margen),
    }));
}
