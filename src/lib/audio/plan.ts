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
  gananciaFondo: number;
  pausaSeg: number;
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
  fondo: { pista: string; ganancia: number; entrada: number; salida: number };
};

/** Segundos de fondo solo, antes de la primera palabra. */
export const ENTRADA_FONDO = 2;
/** Segundos de fondo solo, después de la última palabra. */
export const SALIDA_FONDO = 3;

export function construirPlan(
  frases: Frase[],
  ajustes: AjustesAudio,
  permutacion?: number[],
): PlanDeMezcla {
  if (ajustes.gananciaFondo < 0 || ajustes.gananciaFondo > 1) {
    throw new Error("La ganancia del fondo debe estar entre 0 y 1");
  }
  if (ajustes.pausaSeg < 0) {
    throw new Error("La pausa no puede ser negativa");
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
  let reloj = ENTRADA_FONDO;

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
    duracionTotal: redondear(reloj + SALIDA_FONDO),
    voz,
    fondo: {
      pista: ajustes.fondo,
      ganancia: ajustes.gananciaFondo,
      entrada: ENTRADA_FONDO,
      salida: SALIDA_FONDO,
    },
  };
}

/** Evita que la suma de decimales arrastre errores de coma flotante. */
function redondear(n: number): number {
  return Number(n.toFixed(6));
}
