/**
 * Guía de interpretación: cómo decir cada frase.
 *
 * La app ya sabía dejar la voz limpia, pero no ayudaba a decirla con
 * intención — y una lectura plana no la arregla ningún filtro. Esto pinta
 * cada palabra con la intención que le toca y calcula a qué ritmo debería ir,
 * para que la pantalla acompañe a quien graba como lo haría un director.
 *
 * Las reglas son deliberadamente simples y explicables. Cuando la IA se
 * encargue de marcar, cambiará solo `marcarFrase`: los tiempos, los colores
 * y la pantalla no se enteran.
 */

export type Intencion = "suave" | "normal" | "fuerza";

export type PalabraMarcada = { texto: string; intencion: Intencion };

export type PalabraEnElTiempo = PalabraMarcada & {
  desdeSeg: number;
  hastaSeg: number;
};

export type FraseGuiada = {
  palabras: PalabraEnElTiempo[];
  desdeSeg: number;
  hastaSeg: number;
};

/**
 * Palabras que sostienen la frase pero no cargan significado. Se dicen
 * rápido y bajo; marcarlas es la mitad del trabajo de que algo suene natural.
 */
const RELLENO = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas",
  "de", "del", "a", "al", "en", "y", "o", "u", "que", "se",
  "su", "sus", "mi", "mis", "tu", "tus", "lo", "le", "les",
  "por", "para", "con", "sin", "es", "son", "ser", "soy",
  "está", "están", "estoy", "más", "ya", "no", "ni", "como",
  "cuando", "donde", "me", "te", "nos", "he", "ha", "hay",
]);

/** Segundos que dura cada palabra según cómo se dice. */
const DURACION: Record<Intencion, number> = {
  suave: 0.34,
  normal: 0.5,
  fuerza: 0.78,
};

/** El aire entre frase y frase. Sin esto, todo suena a lista. */
export const RESPIRACION_SEG = 1.2;

/** Quita tildes y puntuación para poder comparar con la lista de relleno. */
function raiz(palabra: string): string {
  return palabra
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");
}

function esRelleno(palabra: string): boolean {
  return RELLENO.has(raiz(palabra));
}

export function marcarFrase(texto: string): PalabraMarcada[] {
  const palabras = texto.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [];
  if (palabras.length === 1) {
    return [{ texto: palabras[0], intencion: "fuerza" }];
  }

  const intenciones: Intencion[] = palabras.map((p) =>
    esRelleno(p) ? "suave" : "normal",
  );

  // El final de una frase sentida baja, no se grita.
  const ultimaDeContenido = intenciones.lastIndexOf("normal");
  if (ultimaDeContenido !== -1) intenciones[ultimaDeContenido] = "suave";

  // Los apoyos: las palabras más cargadas de las que quedan. Una basta casi
  // siempre; una frase larga aguanta dos sin volverse un semáforo.
  const candidatas = palabras
    .map((p, i) => ({ i, largo: raiz(p).length }))
    .filter(({ i }) => intenciones[i] === "normal")
    .sort((a, b) => b.largo - a.largo || a.i - b.i);

  const cuantos = palabras.length >= 12 ? 2 : 1;
  for (const { i } of candidatas.slice(0, cuantos)) {
    intenciones[i] = "fuerza";
  }

  return palabras.map((texto, i) => ({ texto, intencion: intenciones[i] }));
}

export function construirGuion(frases: string[]): FraseGuiada[] {
  const guion: FraseGuiada[] = [];
  let reloj = 0;

  for (const frase of frases) {
    const marcadas = marcarFrase(frase);
    if (marcadas.length === 0) continue;

    const desdeFrase = reloj;
    const palabras: PalabraEnElTiempo[] = marcadas.map((p) => {
      const desdeSeg = Number(reloj.toFixed(3));
      reloj += DURACION[p.intencion];
      return { ...p, desdeSeg, hastaSeg: Number(reloj.toFixed(3)) };
    });

    guion.push({
      palabras,
      desdeSeg: Number(desdeFrase.toFixed(3)),
      hastaSeg: Number(reloj.toFixed(3)),
    });

    reloj += RESPIRACION_SEG;
  }

  return guion;
}

/** Cuánto dura el guion completo, respiraciones incluidas. */
export function duracionDelGuion(guion: FraseGuiada[]): number {
  return guion.length === 0 ? 0 : guion[guion.length - 1].hastaSeg;
}

/**
 * Cuánto se lleva dicho, contado en PALABRAS encendidas (de 0 a 1).
 *
 * No se mide por reloj a propósito: el tiempo incluye las respiraciones y
 * cada palabra dura distinto según su intención, así que una barra por reloj
 * avanzaría a un paso y el texto se pintaría a otro. Contando palabras, lo
 * que ves y lo que marca la barra van exactamente igual — y el ritmo es
 * justamente lo que la guía intenta enseñar.
 */
export function avanceDelGuion(guion: FraseGuiada[], segundos: number): number {
  const todas = guion.flatMap((f) => f.palabras);
  if (todas.length === 0) return 1;

  // Se cuentan las TERMINADAS, no las encendidas: la primera se enciende en
  // el segundo cero, así que contar encendidas haría que la barra arrancara
  // ya mordida.
  const dichas = todas.filter((p) => segundos >= p.hastaSeg).length;
  return dichas / todas.length;
}
