/**
 * "Cuándo fue esto" en lenguaje de persona.
 *
 * Recibe el ahora como parámetro en vez de mirar el reloj: así se puede
 * probar sin trucos y no cambia de resultado según el día en que corran las
 * pruebas.
 *
 * Trabaja con diferencias, no con calendario, así que no le afecta la zona
 * horaria — que en este proyecto ya dio problemas en el CRM.
 */
const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

export function haceCuanto(fecha: Date, ahora: Date = new Date()): string {
  // Nunca negativo: el reloj del teléfono suele ir unos segundos corrido
  // respecto al del servidor.
  const ms = Math.max(0, ahora.getTime() - fecha.getTime());

  if (ms < MINUTO) return "recién";

  if (ms < HORA) {
    return `hace ${Math.floor(ms / MINUTO)} min`;
  }
  if (ms < DIA) {
    return `hace ${Math.floor(ms / HORA)} h`;
  }

  const dias = Math.floor(ms / DIA);
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;

  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return `hace ${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
  }

  const meses = Math.floor(dias / 30);
  return `hace ${meses} ${meses === 1 ? "mes" : "meses"}`;
}
