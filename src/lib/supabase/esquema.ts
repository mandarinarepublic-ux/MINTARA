/**
 * Schema propio dentro del proyecto Supabase compartido (convive con
 * `crm`, `inbox`, `mata` y `rrhh`).
 *
 * Vive en su propio archivo para que lo importen tanto el cliente del
 * navegador como el del servidor, sin arrastrar `next/headers` al bundle
 * del navegador.
 */
export const SCHEMA = "voz";
