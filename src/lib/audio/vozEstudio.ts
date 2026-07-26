/**
 * "Sonido de estudio" hecho en el navegador.
 *
 * Lo que la gente oye como "grabado en estudio" no es ausencia de ruido:
 * es volumen parejo, dinámica controlada y una voz con presencia. Eso es
 * lo que hace esta cadena, gratis y sin mandar el audio a ningún lado:
 *
 *   1. Corte de graves  — quita el retumbe del cuarto y el golpeteo del
 *                         micrófono, que enturbian la voz.
 *   2. Presencia        — un realce suave cerca de 3 kHz, la zona donde
 *                         vive la inteligibilidad de la voz humana.
 *   3. Compresión       — acerca las sílabas flojas a las fuertes, para
 *                         que no haya que subir y bajar el volumen.
 *   4. Normalización    — deja todas las grabaciones al mismo nivel, sin
 *                         importar si la persona habló pegada al micrófono
 *                         o a un metro de distancia.
 *
 * El cálculo de la normalización está separado y es puro, porque es la
 * única parte donde un error se traduce en un audio inservible (mudo o
 * saturado) y conviene poder probarlo sin oírlo.
 */

/** Nivel de energía al que se lleva toda voz. Elegido a oído: audible sin saturar. */
export const RMS_OBJETIVO = 0.12;

/** Techo de amplificación: sin esto, un silencio se convertiría en ruido a todo volumen. */
export const GANANCIA_MAXIMA = 8;

/** Por debajo de esto se considera que no hay voz que normalizar. */
const RMS_MINIMO = 0.0005;

export function rmsDe(muestras: Float32Array): number {
  let suma = 0;
  for (let i = 0; i < muestras.length; i++) suma += muestras[i] * muestras[i];
  return Math.sqrt(suma / muestras.length);
}

export function calcularGananciaNormalizacion(
  muestras: Float32Array,
  objetivo = RMS_OBJETIVO,
): number {
  const rms = rmsDe(muestras);
  if (rms < RMS_MINIMO) return 1;
  return Math.min(objetivo / rms, GANANCIA_MAXIMA);
}

export type CadenaEstudio = { entrada: AudioNode; salida: AudioNode };

/**
 * Arma la cadena y devuelve sus extremos: se conecta la voz a `entrada` y
 * `salida` al destino. Los valores están fijos a propósito — son un preset
 * de voz hablada, no perillas para que el usuario adivine.
 */
export function crearCadenaEstudio(
  contexto: AudioContext,
  ganancia: number,
): CadenaEstudio {
  const graves = contexto.createBiquadFilter();
  graves.type = "highpass";
  graves.frequency.value = 85;

  const presencia = contexto.createBiquadFilter();
  presencia.type = "peaking";
  presencia.frequency.value = 3000;
  presencia.Q.value = 0.9;
  presencia.gain.value = 3;

  const compresor = contexto.createDynamicsCompressor();
  compresor.threshold.value = -24;
  compresor.knee.value = 12;
  compresor.ratio.value = 3.5;
  compresor.attack.value = 0.004;
  compresor.release.value = 0.25;

  const volumen = contexto.createGain();
  volumen.gain.value = ganancia;

  graves.connect(presencia);
  presencia.connect(compresor);
  compresor.connect(volumen);

  return { entrada: graves, salida: volumen };
}
