import { limpiarValor } from "./entorno.ts";

export type FormaDeEntrar = "celular" | "correo";

/** Lo que la app considera un «sí». Cualquier otra cosa deja la función apagada. */
const ENCENDIDO = new Set(["1", "si", "sí", "true", "on", "yes"]);

/**
 * Qué formas de entrar se le ofrecen a la persona.
 *
 * El correo está APAGADO mientras no exista `INGRESO_POR_CORREO`. No es
 * timidez: sin SMTP propio configurado en Supabase, el correo con el código
 * solo llega a miembros del equipo del proyecto (y 2 por hora). Si la opción
 * se viera sin eso, cualquier cliente que la eligiera recibiría un error y se
 * quedaría afuera. Más vale que no exista a que exista y falle.
 *
 * Recibe el entorno en vez de leer `process.env` para poder probarlo.
 */
export function formasDeEntrar(
  entorno: Record<string, string | undefined> = process.env,
): FormaDeEntrar[] {
  const bruto = entorno.INGRESO_POR_CORREO;
  if (bruto === undefined) return ["celular"];

  // limpiarValor quita el BOM invisible que PowerShell le pega a las
  // variables al cargarlas a Vercel; sin esto la función quedaría apagada en
  // producción sin que nadie entienda por qué.
  const valor = limpiarValor(bruto).toLowerCase();

  // El celular va primero siempre: es lo que ya usa la gente.
  return ENCENDIDO.has(valor) ? ["celular", "correo"] : ["celular"];
}

export function hayCorreo(
  entorno: Record<string, string | undefined> = process.env,
): boolean {
  return formasDeEntrar(entorno).includes("correo");
}
