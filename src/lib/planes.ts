/**
 * Límites de cada plan.
 *
 * El único costo variable del producto es el pulido con IA, y se paga una
 * vez por grabación. Por eso el límite del plan gratis son las GRABACIONES
 * y no el uso: armar audios, cambiar fondos y escuchar mil veces no le
 * cuesta nada a nadie.
 */
export type Plan = "gratis" | "pago";

export const LIMITES = {
  gratis: { grabaciones: 1, fondos: ["lluvia", "rio"], sinInternet: false },
  pago: {
    grabaciones: 20,
    fondos: ["lluvia", "rio", "mar", "bosque", "tormenta"],
    sinInternet: true,
  },
} as const;

export function puedeGrabar(plan: Plan, grabacionesActuales: number): boolean {
  return grabacionesActuales < LIMITES[plan].grabaciones;
}

export function fondosPermitidos(plan: Plan): string[] {
  return [...LIMITES[plan].fondos];
}

export function puedeUsarSinInternet(plan: Plan): boolean {
  return LIMITES[plan].sinInternet;
}
