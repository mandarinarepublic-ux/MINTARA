/**
 * Validar y normalizar correos.
 *
 * Normalizar importa tanto como validar: si «Rodrigo@Gmail.com » y
 * «rodrigo@gmail.com» entran distintos, acaban siendo dos cuentas con dos
 * bibliotecas, y la persona jura que perdió sus audios. Es el mismo problema
 * que ya se vio con dos números de celular.
 *
 * La comprobación es a propósito estricta y sencilla. Un correo con tilde o
 * con espacios es casi siempre un error de dedo, y dejarlo pasar solo
 * consigue que el código no llegue nunca y que la persona se quede afuera sin
 * saber por qué.
 */

const FORMA = /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

/** Devuelve el correo listo para guardar, o `null` si no sirve. */
export function normalizarCorreo(crudo: string): string | null {
  const limpio = crudo.trim().toLowerCase();

  // 254 es el máximo que admite el estándar; más que eso es basura o ataque.
  if (limpio.length === 0 || limpio.length > 254) return null;
  if (!FORMA.test(limpio)) return null;

  // Dos puntos seguidos pasan la forma de arriba pero no son un dominio real.
  if (limpio.includes("..")) return null;

  return limpio;
}

/** Para mostrarlo sin dejarlo entero a la vista de quien mire la pantalla. */
export function ocultarCorreo(correo: string): string {
  const [antes, dominio] = correo.split("@");
  if (!dominio) return correo;

  // Con dos letras o menos no se muestra ninguna: dejarlas sería enseñar el
  // nombre entero.
  return antes.length > 2
    ? `${antes.slice(0, 2)}•••@${dominio}`
    : `••@${dominio}`;
}
