"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";

/**
 * Cierra la sesión recién abierta y devuelve a la pantalla de ingresar.
 *
 * Hay que cerrarla de verdad: si se deja abierta, el proxy ve una sesión
 * válida y la persona vuelve a caer en la misma cuenta vacía de la que está
 * intentando salir.
 */
export async function salirYVolverAIngresar(): Promise<void> {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();
  redirect("/ingresar");
}
