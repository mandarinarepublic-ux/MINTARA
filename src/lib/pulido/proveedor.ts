/**
 * Contrato del servicio que deja la voz sonando a estudio.
 *
 * Está detrás de una interfaz porque el proveedor se elige comparando
 * calidad y precio, y puede cambiar: hoy ElevenLabs (un solo POST que
 * devuelve el audio), pero Auphonic cuesta entre 3 y 9 veces menos. Si se
 * migra, se cambia `elegido.ts` y nada más.
 */
export type ResultadoPulido =
  | { ok: true; audio: ArrayBuffer; tipo: string }
  | { ok: false; motivo: string };

export interface ProveedorDePulido {
  nombre: string;
  pulir(audio: Blob, tipo: string): Promise<ResultadoPulido>;
}

/** Traduce la respuesta HTTP del servicio a un resultado nuestro. */
export async function interpretarRespuesta(resp: Response): Promise<ResultadoPulido> {
  if (!resp.ok) {
    const detalle = (await resp.text()).slice(0, 300);
    return { ok: false, motivo: `El servicio respondió ${resp.status}: ${detalle}` };
  }
  const audio = await resp.arrayBuffer();
  if (audio.byteLength === 0) {
    return { ok: false, motivo: "El servicio devolvió un audio vacío" };
  }
  return { ok: true, audio, tipo: resp.headers.get("content-type") ?? "audio/mpeg" };
}
