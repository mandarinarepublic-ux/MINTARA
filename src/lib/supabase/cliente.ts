"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SCHEMA } from "./esquema";

/**
 * Cliente para el navegador. Lee las variables NEXT_PUBLIC_ directo de
 * process.env porque Next las reemplaza en tiempo de compilación: aquí no
 * sirve el helper `leerEntorno`, que lee en tiempo de ejecución.
 */
export function supabaseNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: SCHEMA } },
  );
}
