/**
 * Planificador de mezcla.
 *
 * No suena nada aquí: esto solo decide QUÉ suena, CUÁNDO y CON QUÉ volumen,
 * y lo devuelve como datos. El reproductor ejecuta ese plan.
 *
 * La razón de separarlo: los errores de audio son horribles de cazar oyendo
 * —una pausa de más, dos frases pisadas, un desvanecido que corta la última
 * palabra—. Como el plan es una estructura de datos, esos errores se cazan
 * leyendo.
 */

export type Frase = { inicio: number; fin: number };

export type AjustesAudio = {
  fondo: string;
  /**
   * Volumen de la voz, independiente del fondo. Se multiplica encima de la
   * normalización automática: 1 deja la voz en su nivel parejo, 0.4 la pone
   * por detrás del ambiente, 0 la calla y queda solo el paisaje sonoro.
   */
  gananciaVoz: number;
  gananciaFondo: number;
  pausaSeg: number;
  /** Segundos que tarda el ambiente en aparecer, antes de la primera palabra. */
  entradaSeg: number;
  /** Segundos que tarda en apagarse al final, ya sin voz. Es lo que deja dormir. */
  salidaSeg: number;
  orden: "original" | "barajado";
};

export type BloqueVoz = {
  frase: number;
  entraEn: number;
  desde: number;
  hasta: number;
};

export type PlanDeMezcla = {
  duracionTotal: number;
  voz: BloqueVoz[];
  gananciaVoz: number;
  fondo: { pista: string; ganancia: number; entrada: number; salida: number };
};

/** Entrada por defecto: segundos de ambiente solo antes de la primera palabra. */
export const ENTRADA_FONDO = 2;
/** Salida por defecto: segundos de ambiente solo tras la última palabra. */
export const SALIDA_FONDO = 3;

/** Topes de los desvanecidos. Más allá deja de ser una transición. */
const ENTRADA_MAXIMA = 60;
const SALIDA_MAXIMA = 120;

export function construirPlan(
  frases: Frase[],
  ajustes: AjustesAudio,
  permutacion?: number[],
): PlanDeMezcla {
  if (ajustes.gananciaFondo < 0 || ajustes.gananciaFondo > 1) {
    throw new Error("La ganancia del fondo debe estar entre 0 y 1");
  }
  // La voz llega hasta 2 porque puede hacer falta empujarla por encima de un
  // ambiente denso; más que eso ya sería distorsión, no volumen.
  if (ajustes.gananciaVoz < 0 || ajustes.gananciaVoz > 2) {
    throw new Error("La ganancia de la voz debe estar entre 0 y 2");
  }
  if (ajustes.pausaSeg < 0) {
    throw new Error("La pausa no puede ser negativa");
  }
  if (ajustes.entradaSeg < 0 || ajustes.entradaSeg > ENTRADA_MAXIMA) {
    throw new Error(`La entrada debe estar entre 0 y ${ENTRADA_MAXIMA} segundos`);
  }
  if (ajustes.salidaSeg < 0 || ajustes.salidaSeg > SALIDA_MAXIMA) {
    throw new Error(`La salida debe estar entre 0 y ${SALIDA_MAXIMA} segundos`);
  }
  for (const f of frases) {
    if (f.fin <= f.inicio) {
      throw new Error(
        `Frase inválida: fin ${f.fin} no es posterior a inicio ${f.inicio}`,
      );
    }
  }

  const indices =
    ajustes.orden === "barajado" && permutacion
      ? permutacion
      : frases.map((_, i) => i);

  const voz: BloqueVoz[] = [];
  let reloj = ajustes.entradaSeg;

  indices.forEach((indice, posicion) => {
    const f = frases[indice];
    if (posicion > 0) reloj += ajustes.pausaSeg;
    voz.push({
      frase: indice,
      entraEn: redondear(reloj),
      desde: f.inicio,
      hasta: f.fin,
    });
    reloj += f.fin - f.inicio;
  });

  return {
    duracionTotal: redondear(reloj + ajustes.salidaSeg),
    voz,
    gananciaVoz: ajustes.gananciaVoz,
    fondo: {
      pista: ajustes.fondo,
      ganancia: ajustes.gananciaFondo,
      entrada: ajustes.entradaSeg,
      salida: ajustes.salidaSeg,
    },
  };
}

/** Evita que la suma de decimales arrastre errores de coma flotante. */
function redondear(n: number): number {
  return Number(n.toFixed(6));
}
