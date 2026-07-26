/**
 * Catálogo de ambientes.
 *
 * Son tres, como manda el diseño, y cada uno tiene un para qué: no son
 * "sonidos bonitos", son momentos del día. Esa promesa aparece en el
 * landing y en la pantalla de mezcla.
 */
export type Fondo = { id: string; nombre: string; para: string };

export const FONDOS: Fondo[] = [
  { id: "lluvia", nombre: "Lluvia", para: "Para dormir y soltar el día" },
  { id: "rio", nombre: "Río", para: "Para concentrarte y avanzar" },
  { id: "mar", nombre: "Mar", para: "Para empezar la mañana" },
];

export function rutaDeFondo(id: string): string {
  return `/fondos/${id}.mp3`;
}

export function nombreDeFondo(id: string): string {
  return FONDOS.find((f) => f.id === id)?.nombre ?? id;
}
