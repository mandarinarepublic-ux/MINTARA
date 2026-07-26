/**
 * Elección del formato de grabación.
 *
 * Safari en iPhone no soporta webm; Chrome en Android sí y produce archivos
 * mucho más chicos. Sin esta negociación, MediaRecorder falla en la mitad
 * de los celulares del país.
 *
 * `elegirFormato` recibe el comprobador como parámetro para poder probarla
 * sin navegador; `formatoSoportado` es la que se usa de verdad.
 */
const CANDIDATOS = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

export function elegirFormato(soporta: (mime: string) => boolean): string | null {
  return CANDIDATOS.find(soporta) ?? null;
}

export function formatoSoportado(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return elegirFormato((m) => MediaRecorder.isTypeSupported(m));
}

export function extensionDe(mime: string): string {
  if (mime.startsWith("audio/webm")) return "webm";
  if (mime.startsWith("audio/mp4")) return "m4a";
  return "bin";
}
