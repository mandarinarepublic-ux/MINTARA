/**
 * Límites y precios de los planes.
 *
 * Los valores salen del handoff de diseño (sección Precios). Viven aquí y
 * no dentro de las pantallas porque **no están cerrados**: cambiar el precio
 * o el límite debe ser editar una línea, no cazar cifras por el código.
 *
 * Desde que el sonido de estudio se hace en el navegador, el producto no
 * tiene costo por uso: estos límites son decisiones comerciales, no una
 * defensa contra una factura.
 */
export type Plan = "gratis" | "premium";

export const LIMITES = {
  gratis: {
    audios: 1,
    segundos: 60,
    fondos: ["lluvia"],
    sinInternet: false,
  },
  premium: {
    // Un tope alto que en la práctica nadie alcanza, pero que evita que una
    // cuenta comprometida llene el almacenamiento sin freno.
    audios: 500,
    segundos: 600,
    fondos: ["lluvia", "rio", "mar"],
    sinInternet: true,
  },
} as const;

export const PRECIOS = {
  mensual: { monto: 6.99, moneda: "USD", etiqueta: "$6,99 / mes" },
  anual: { monto: 49.99, moneda: "USD", etiqueta: "$49,99 / año" },
} as const;

export function puedeGrabar(plan: Plan, audiosActuales: number): boolean {
  return audiosActuales < LIMITES[plan].audios;
}

export function duracionMaximaSeg(plan: Plan): number {
  return LIMITES[plan].segundos;
}

export function fondosPermitidos(plan: Plan): string[] {
  return [...LIMITES[plan].fondos];
}

export function puedeUsarSinInternet(plan: Plan): boolean {
  return LIMITES[plan].sinInternet;
}
