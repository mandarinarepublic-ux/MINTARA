import { supabaseServidor } from "@/lib/supabase/servidor";
import { PAQUETES, type Paquete } from "./paquetes";

/**
 * Las listas de afirmaciones, desde la base.
 *
 * Igual que con los textos de pantalla: si en la base no hay nada todavía, o
 * la consulta falla, se devuelven las cinco listas del código. Alguien que
 * entra a grabar tiene que encontrar frases sí o sí; una pantalla de
 * afirmaciones vacía no tiene ningún uso.
 *
 * Se descartan las listas que quedaron sin frases: una lista vacía es un botón
 * que al tocarlo no ofrece nada. El panel ya impide dejarlas así, pero por si
 * alguna se cuela.
 */
export async function obtenerPaquetes(): Promise<Paquete[]> {
  try {
    const supabase = await supabaseServidor();
    const [{ data: paquetes }, { data: frases }] = await Promise.all([
      supabase
        .from("paquetes")
        .select("id, nombre, descripcion, orden, activo")
        .eq("activo", true)
        .order("orden"),
      supabase.from("frases").select("paquete, texto, orden").order("orden"),
    ]);

    if (!paquetes || paquetes.length === 0) return PAQUETES;

    const armados: Paquete[] = paquetes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      frases: (frases ?? [])
        .filter((f) => f.paquete === p.id)
        .map((f) => f.texto),
    }));

    const conFrases = armados.filter((p) => p.frases.length > 0);
    return conFrases.length > 0 ? conFrases : PAQUETES;
  } catch {
    return PAQUETES;
  }
}

/** Todas, incluidas las apagadas: es lo que necesita ver quien administra. */
export async function obtenerPaquetesParaEditar(): Promise<
  (Paquete & { orden: number; activo: boolean })[]
> {
  const supabase = await supabaseServidor();
  const [{ data: paquetes }, { data: frases }] = await Promise.all([
    supabase
      .from("paquetes")
      .select("id, nombre, descripcion, orden, activo")
      .order("orden"),
    supabase.from("frases").select("id, paquete, texto, orden").order("orden"),
  ]);

  return (paquetes ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    orden: p.orden,
    activo: p.activo,
    frases: (frases ?? []).filter((f) => f.paquete === p.id).map((f) => f.texto),
  }));
}
