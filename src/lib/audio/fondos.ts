/**
 * Catálogo de fondos.
 *
 * Los archivos viven en `public/fondos/` y se sirven estáticos, sin pasar
 * por el proxy (ver el matcher en src/proxy.ts): son varios megas que se
 * piden muchas veces y no necesitan sesión.
 */
export type Fondo = { id: string; nombre: string };

export const FONDOS: Fondo[] = [
  { id: "lluvia", nombre: "Lluvia" },
  { id: "rio", nombre: "Río" },
  { id: "mar", nombre: "Mar" },
  { id: "bosque", nombre: "Bosque" },
  { id: "tormenta", nombre: "Tormenta suave" },
];

export function rutaDeFondo(id: string): string {
  return `/fondos/${id}.mp3`;
}

export function nombreDeFondo(id: string): string {
  return FONDOS.find((f) => f.id === id)?.nombre ?? id;
}
