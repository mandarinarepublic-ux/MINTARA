"use server";
import { supabaseServidor } from "@/lib/supabase/servidor";
import type { Frase } from "@/lib/audio/plan";

/**
 * Guarda las marcas de tiempo de las frases la primera vez que se analizan.
 * Así, al volver mañana, la app no tiene que recalcularlas: abre y suena.
 */
export async function guardarCortes(
  grabacionId: string,
  cortes: Frase[],
): Promise<void> {
  const supabase = await supabaseServidor();
  await supabase.from("grabaciones").update({ cortes }).eq("id", grabacionId);
}
