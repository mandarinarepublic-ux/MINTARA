/**
 * Las reglas de editar una lista de afirmaciones.
 *
 * Viven aquí, aparte de la pantalla, porque son lo que de verdad conviene
 * poder probar: los dos frenos que impiden dejar la app rota y el orden de las
 * frases, que es lo que se oye al grabar.
 */

/** Sube o baja una frase. Devuelve una lista nueva; no toca la que recibe. */
export function moverFrase(
  frases: string[],
  desde: number,
  hacia: -1 | 1,
): string[] {
  const destino = desde + hacia;
  if (destino < 0 || destino >= frases.length) return [...frases];

  const copia = [...frases];
  [copia[desde], copia[destino]] = [copia[destino], copia[desde]];
  return copia;
}

export function quitarFrase(frases: string[], cual: number): string[] {
  return frases.filter((_, i) => i !== cual);
}

/** Las que de verdad se van a grabar: las que tienen algo escrito. */
export function frasesUtiles(frases: string[]): string[] {
  return frases.map((f) => f.trim()).filter((f) => f.length > 0);
}

/**
 * Freno: la última lista encendida no se apaga.
 *
 * Sin ninguna encendida, la pantalla de elegir afirmaciones se quedaría sin
 * nada que ofrecer y no habría forma de grabar.
 */
export function puedeApagarse(idsActivas: string[], id: string): boolean {
  if (!idsActivas.includes(id)) return true;
  return idsActivas.length > 1;
}

/** Un id de tabla a partir del nombre: sin tildes, espacios ni mayúsculas. */
export function idDesdeNombre(nombre: string): string {
  const limpio = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  // Un nombre entero de signos dejaría el id vacío, y sin id no hay fila.
  return limpio.length > 0 ? limpio : "lista";
}
