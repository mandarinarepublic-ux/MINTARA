/**
 * Normalización de celulares ecuatorianos a E.164.
 *
 * Supabase Auth exige el formato +593XXXXXXXXX. La gente escribe su número
 * de cinco maneras distintas, así que se normaliza antes de pedir el
 * código: un número mal formado significa un WhatsApp que nunca llega y
 * una persona esperando frente a una pantalla.
 */
export function normalizarCelular(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "");

  let nacional: string;
  if (digitos.startsWith("593")) nacional = digitos.slice(3);
  else if (digitos.startsWith("0")) nacional = digitos.slice(1);
  else nacional = digitos;

  // Celular ecuatoriano: 9 dígitos empezando en 9.
  if (!/^9\d{8}$/.test(nacional)) return null;
  return `+593${nacional}`;
}

export function ocultarCelular(e164: string): string {
  return `••••• ${e164.slice(-4)}`;
}
