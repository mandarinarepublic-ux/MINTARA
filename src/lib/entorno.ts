/**
 * Lectura de variables de entorno a prueba de BOM.
 *
 * Cargar variables a Vercel desde PowerShell les pega un BOM invisible
 * (﻿) al inicio. El valor se ve idéntico en el panel, pero Supabase
 * falla SOLO en producción con "TypeError ... ByteString ... 65279".
 * Por eso nadie lee process.env directo en este proyecto.
 */
export function limpiarValor(bruto: string): string {
  return bruto
    .replace(/^﻿/, "")
    .trim()
    // [\s\S] en vez de la bandera /s: esa bandera exige target es2018 y el
    // tsconfig que genera create-next-app apunta más abajo.
    .replace(/^["']([\s\S]*)["']$/, "$1")
    .trim();
}

export function leerEntorno(nombre: string): string | undefined {
  const bruto = process.env[nombre];
  if (bruto === undefined) return undefined;
  const limpio = limpiarValor(bruto);
  return limpio === "" ? undefined : limpio;
}

export function exigirEntorno(nombre: string): string {
  const valor = leerEntorno(nombre);
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
}
