import "server-only";
import { createClient } from "@supabase/supabase-js";
import { exigirEntorno } from "@/lib/entorno";
import { SCHEMA } from "./esquema";

/**
 * Cliente con service role: SALTA RLS.
 *
 * Solo para el pulido, que actualiza grabaciones en nombre de la persona.
 * El import de "server-only" hace fallar la compilación si alguien lo
 * importa desde un componente de cliente, que es justo el accidente que
 * filtraría la clave maestra al navegador.
 */
export function supabaseAdmin() {
  return createClient(
    exigirEntorno("NEXT_PUBLIC_SUPABASE_URL"),
    exigirEntorno("SUPABASE_SERVICE_ROLE_KEY"),
    { db: { schema: SCHEMA }, auth: { persistSession: false } },
  );
}
