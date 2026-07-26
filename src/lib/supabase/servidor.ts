import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { exigirEntorno } from "@/lib/entorno";
import { SCHEMA } from "./esquema";

export { SCHEMA };

/**
 * Cliente de Supabase para Server Components, Server Actions y Route
 * Handlers. Usa la clave anónima, así que TODO lo que lea pasa por RLS.
 */
export async function supabaseServidor() {
  const almacen = await cookies();

  return createServerClient(
    exigirEntorno("NEXT_PUBLIC_SUPABASE_URL"),
    exigirEntorno("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      db: { schema: SCHEMA },
      cookies: {
        getAll() {
          return almacen.getAll();
        },
        setAll(cookiesNuevas) {
          try {
            cookiesNuevas.forEach(({ name, value, options }) =>
              almacen.set(name, value, options),
            );
          } catch {
            // Los Server Components no pueden escribir cookies. El refresco
            // de sesión lo hace el proxy, así que aquí se ignora.
          }
        },
      },
    },
  );
}
