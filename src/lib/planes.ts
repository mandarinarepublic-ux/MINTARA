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
    sinInternet: false,
  },
  premium: {
    // Un tope alto que en la práctica nadie alcanza, pero que evita que una
    // cuenta comprometida llene el almacenamiento sin freno.
    audios: 500,
    segundos: 600,
    sinInternet: true,
  },
} as const;

/*
 * Qué ambientes ve cada plan ya NO se decide aquí: cada ambiente lleva su
 * propia marca de "gratis" y la pone el admin desde el panel. Ver
 * `ambientesPermitidos` en lib/ambientes.ts.
 */

export const PRECIOS = {
  mensual: { monto: 6.99, moneda: "USD", etiqueta: "$6,99 / mes" },
  anual: { monto: 49.99, moneda: "USD", etiqueta: "$49,99 / año" },
} as const;

/**
 * El plan con el que se trata a alguien.
 *
 * Quien administra nunca topa con los límites: necesita grabar una y otra
 * vez para probar el producto, y quedarse sin audios a mitad de una prueba
 * es la clase de fricción que hace perder una tarde.
 */
export function planEfectivo(plan: Plan, rol?: string | null): Plan {
  return rol === "admin" ? "premium" : plan;
}

export function puedeGrabar(plan: Plan, audiosActuales: number): boolean {
  return audiosActuales < LIMITES[plan].audios;
}

export function duracionMaximaSeg(plan: Plan): number {
  return LIMITES[plan].segundos;
}

export function puedeUsarSinInternet(plan: Plan): boolean {
  return LIMITES[plan].sinInternet;
}
