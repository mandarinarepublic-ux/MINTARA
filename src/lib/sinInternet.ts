// Con extensión .ts: el runner de Node no resuelve imports sin extensión, y
// este módulo lo alcanzan las pruebas.
import { rutaDeFondo } from "./audio/fondos.ts";

/**
 * Guardado en el celular para escuchar sin internet.
 *
 * Usa la Cache API del navegador, no descargas: el audio queda dentro del
 * espacio de la app, no en la carpeta de descargas del teléfono, así que
 * sigue sin existir un archivo que se pueda mandar a otra persona.
 *
 * Las dos funciones puras (nombre del cajón y lista de URLs) están
 * separadas para poder probarlas sin navegador.
 */
export function nombreDeCache(grabacionId: string): string {
  return `mi-voz-${grabacionId}`;
}

export function urlsAGuardar(vozUrl: string, fondos: string[]): string[] {
  return [vozUrl, ...fondos.map(rutaDeFondo)];
}

export async function guardarParaSinInternet(
  grabacionId: string,
  vozUrl: string,
  fondos: string[],
): Promise<void> {
  const cajon = await caches.open(nombreDeCache(grabacionId));
  await cajon.addAll(urlsAGuardar(vozUrl, fondos));
}

export async function estaGuardado(grabacionId: string): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  const nombres = await caches.keys();
  return nombres.includes(nombreDeCache(grabacionId));
}

export async function borrarGuardado(grabacionId: string): Promise<void> {
  await caches.delete(nombreDeCache(grabacionId));
}
