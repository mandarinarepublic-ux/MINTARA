import type { Plan } from "./planes.ts";

/**
 * Catálogo de ambientes.
 *
 * Vive en la base de datos, no en el código: los sube y los edita el admin
 * desde el panel, sin desplegar nada. Aquí solo están los tipos y las
 * transformaciones puras, que son las que conviene poder probar.
 */
export type Familia = {
  slug: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activa: boolean;
};

export type Ambiente = {
  id: string;
  familia: string;
  nombre: string;
  ruta: string;
  gratis: boolean;
  activo: boolean;
  orden: number;
};

export type FamiliaConAmbientes = Familia & { ambientes: Ambiente[] };

export function agruparPorFamilia(
  familias: Familia[],
  ambientes: Ambiente[],
): FamiliaConAmbientes[] {
  return familias
    .filter((f) => f.activa)
    .sort((a, b) => a.orden - b.orden)
    .map((f) => ({
      ...f,
      ambientes: ambientes
        .filter((a) => a.activo && a.familia === f.slug)
        .sort((a, b) => a.orden - b.orden),
    }))
    // Una familia vacía sería una ficha que al tocarla no suena.
    .filter((f) => f.ambientes.length > 0);
}

export function ambientesPermitidos(ambientes: Ambiente[], plan: Plan): Ambiente[] {
  return ambientes
    .filter((a) => a.activo)
    .filter((a) => plan === "premium" || a.gratis)
    // Primero por familia y luego por orden: sin el primer criterio, mezclar
    // variantes de familias distintas daba una lista que cambiaba de orden
    // según cómo llegaran de la base.
    .sort(
      (a, b) => a.familia.localeCompare(b.familia) || a.orden - b.orden,
    );
}

/** El bucket es público: los sonidos de lluvia no necesitan firma ni secreto. */
export function urlDeAmbiente(ruta: string, urlSupabase: string): string {
  return `${urlSupabase}/storage/v1/object/public/fondos/${ruta}`;
}
