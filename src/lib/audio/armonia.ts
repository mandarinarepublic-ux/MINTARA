import type { PlanDeMezcla } from "./plan.ts";

/**
 * Lo que convierte dos capas sueltas en una pieza.
 *
 * Tres cosas, todas hechas por código y sin archivos:
 *
 *   1. El ambiente se agacha cuando entra la voz y vuelve en los silencios.
 *      Es lo que hace cualquier producción y lo que más separa "una grabación
 *      con lluvia detrás" de algo que suena hecho a propósito.
 *   2. Un espacio corto alrededor de la voz, para que no suene pegada al
 *      micrófono.
 *   3. Una nota grave sostenida que ata voz y ambiente en una sola cosa.
 */

export type PuntoDeGanancia = { tiempoSeg: number; valor: number };

/** Cuánto se agacha el ambiente mientras hay voz. */
export const AGACHADO = 0.45;

/** Se adelanta a la voz: si baja después, se oye el tirón. */
export const ANTICIPO_SEG = 0.35;

/** Y tarda en volver, para que no parezca un interruptor. */
export const RECUPERACION_SEG = 0.9;

/**
 * Bloques de voz fundidos: dos frases separadas por un suspiro son, para el
 * ambiente, un solo tramo hablado. Sin esto el fondo sube y baja entre frase
 * y frase y la pieza "bombea".
 */
function tramosHablados(plan: PlanDeMezcla): Array<{ desde: number; hasta: number }> {
  const bloques = plan.voz
    .map((b) => ({ desde: b.entraEn, hasta: b.entraEn + (b.hasta - b.desde) }))
    .sort((a, b) => a.desde - b.desde);

  const minimoParaSeparar = ANTICIPO_SEG + RECUPERACION_SEG;
  const tramos: Array<{ desde: number; hasta: number }> = [];

  for (const bloque of bloques) {
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && bloque.desde - ultimo.hasta < minimoParaSeparar) {
      ultimo.hasta = Math.max(ultimo.hasta, bloque.hasta);
    } else {
      tramos.push({ ...bloque });
    }
  }

  return tramos;
}

/**
 * La automatización del volumen del ambiente, como valores relativos (1 es
 * su volumen pleno). Se devuelve como datos para poder comprobarla sin oír.
 */
export function puntosDeAgachado(plan: PlanDeMezcla): PuntoDeGanancia[] {
  const puntos: PuntoDeGanancia[] = [];

  for (const tramo of tramosHablados(plan)) {
    const empiezaABajar = Math.max(0, tramo.desde - ANTICIPO_SEG);
    puntos.push(
      { tiempoSeg: empiezaABajar, valor: 1 },
      { tiempoSeg: tramo.desde, valor: AGACHADO },
      { tiempoSeg: tramo.hasta, valor: AGACHADO },
      { tiempoSeg: tramo.hasta + RECUPERACION_SEG, valor: 1 },
    );
  }

  // Dos tramos muy juntos pueden dejar puntos en el mismo instante; el
  // último gana, que es el que refleja hacia dónde va.
  return puntos.filter(
    (p, i) => i === puntos.length - 1 || puntos[i + 1].tiempoSeg > p.tiempoSeg,
  );
}

/**
 * La "habitación" donde suena la voz.
 *
 * Es ruido que se apaga rápido: al pasarle la voz por encima, suena como si
 * se hubiera grabado en un cuarto tranquilo en vez de pegada al micrófono.
 * Se genera aquí para no tener que descargar ninguna grabación de sala.
 */
export function generarImpulso(hz: number, segundos = 1.2): Float32Array {
  const total = Math.floor(hz * segundos);
  const salida = new Float32Array(total);

  for (let i = 0; i < total; i++) {
    const avance = i / total;
    // Caída exponencial: mucha energía al principio, cola que se desvanece.
    const sobra = Math.pow(1 - avance, 3.2);
    salida[i] = (Math.random() * 2 - 1) * sobra;
  }

  return salida;
}

/** Cuánta habitación se oye. Sutil: la voz manda. */
export const ESPACIO_POR_DEFECTO = 0.18;

/** La nota de fondo: un la grave, y su quinta muy por debajo. */
export const NOTA_GRAVE_HZ = 110;
export const NOTA_QUINTA_HZ = 164.81;
export const VOLUMEN_NOTA = 0.05;
