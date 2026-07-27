/**
 * Guardado en el celular para escuchar sin internet.
 *
 * Usa la Cache API del navegador, no descargas: el audio queda dentro del
 * espacio de la app, no en la carpeta de descargas del teléfono, así que
 * sigue sin existir un archivo que se pueda mandar a otra persona.
 *
 * Las dos funciones puras (nombre del cajón y lista de direcciones) están
 * separadas para poder probarlas sin navegador.
 */
export function nombreDeCache(grabacionId: string): string {
  return `MINTARA-${grabacionId}`;
}

/** La voz y los ambientes que la persona puede usar, todos en una lista. */
export function urlsAGuardar(vozUrl: string, urlsDeAmbientes: string[]): string[] {
  return [vozUrl, ...urlsDeAmbientes];
}

export async function guardarParaSinInternet(
  grabacionId: string,
  vozUrl: string,
  urlsDeAmbientes: string[],
): Promise<void> {
  const cajon = await caches.open(nombreDeCache(grabacionId));
  await cajon.addAll(urlsAGuardar(vozUrl, urlsDeAmbientes));
}

export async function estaGuardado(grabacionId: string): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  const nombres = await caches.keys();
  return nombres.includes(nombreDeCache(grabacionId));
}

export async function borrarGuardado(grabacionId: string): Promise<void> {
  await caches.delete(nombreDeCache(grabacionId));
}
