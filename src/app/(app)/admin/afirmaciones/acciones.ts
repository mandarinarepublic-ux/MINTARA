"use server";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "../permisos";
import { PAQUETES } from "@/lib/afirmaciones/paquetes";
import {
  frasesUtiles,
  idDesdeNombre,
  puedeApagarse,
} from "@/lib/afirmaciones/edicion";

export type EstadoAfirmaciones = { error?: string; ok?: string };

function refrescar() {
  revalidatePath("/admin/afirmaciones");
  revalidatePath("/estudio");
}

/**
 * Copia a la base las cinco listas que hoy viven en el código.
 *
 * Hasta que alguien las traiga, la app usa las del código y esta pantalla no
 * tiene nada que editar. Se hace con un botón y no solo al entrar, para que
 * quede claro qué pasó y cuándo.
 */
export async function traerListasDelCodigo(): Promise<void> {
  const supabase = await exigirAdmin();

  const { data: yaHay } = await supabase.from("paquetes").select("id").limit(1);
  if (yaHay && yaHay.length > 0) return;

  await supabase.from("paquetes").insert(
    PAQUETES.map((p, i) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      orden: i + 1,
      activo: true,
    })),
  );

  await supabase.from("frases").insert(
    PAQUETES.flatMap((p) =>
      p.frases.map((texto, i) => ({ paquete: p.id, texto, orden: i + 1 })),
    ),
  );

  refrescar();
}

/**
 * Guarda una lista completa: nombre, descripción y todas sus frases.
 *
 * Las frases se reescriben enteras en vez de ir una por una. Son seis o siete
 * renglones de texto: distinguir cuál se movió, cuál se editó y cuál se borró
 * costaría más de lo que ahorra.
 */
export async function guardarLista(
  _previo: EstadoAfirmaciones,
  datos: FormData,
): Promise<EstadoAfirmaciones> {
  const supabase = await exigirAdmin();

  const id = String(datos.get("id") ?? "").trim();
  const nombre = String(datos.get("nombre") ?? "").trim();
  const descripcion = String(datos.get("descripcion") ?? "").trim();
  const frases = frasesUtiles(datos.getAll("frase").map((f) => String(f)));

  if (!id) return { error: "Falta saber qué lista se está guardando." };
  if (nombre.length === 0) return { error: "La lista necesita un nombre." };
  if (descripcion.length === 0) {
    return { error: "Escribe para qué sirve esta lista." };
  }

  // Freno: una lista sin frases es un botón que al tocarlo no ofrece nada.
  if (frases.length === 0) {
    return { error: "Una lista no puede quedarse sin frases." };
  }

  const { error: errorLista } = await supabase
    .from("paquetes")
    .update({ nombre, descripcion })
    .eq("id", id);

  if (errorLista) return { error: `No se pudo guardar: ${errorLista.message}` };

  await supabase.from("frases").delete().eq("paquete", id);
  const { error: errorFrases } = await supabase
    .from("frases")
    .insert(frases.map((texto, i) => ({ paquete: id, texto, orden: i + 1 })));

  if (errorFrases) {
    return { error: `Las frases no se guardaron: ${errorFrases.message}` };
  }

  refrescar();
  return { ok: `«${nombre}» guardada, ya está en la app.` };
}

export async function crearLista(
  _previo: EstadoAfirmaciones,
  datos: FormData,
): Promise<EstadoAfirmaciones> {
  const supabase = await exigirAdmin();

  const nombre = String(datos.get("nombre") ?? "").trim();
  if (nombre.length === 0) return { error: "Ponle un nombre a la lista." };

  const id = idDesdeNombre(nombre);

  const { data: existe } = await supabase
    .from("paquetes")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (existe) return { error: "Ya hay una lista que se llama así." };

  const { data: ultimas } = await supabase
    .from("paquetes")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1);

  const orden = (ultimas?.[0]?.orden ?? 0) + 1;

  const { error } = await supabase
    .from("paquetes")
    .insert({ id, nombre, descripcion: "Para…", orden, activo: true });

  if (error) return { error: `No se pudo crear: ${error.message}` };

  // Una lista nace con una frase de ejemplo: sin frases no se puede guardar,
  // y quedaría en un estado que la propia pantalla no deja arreglar.
  await supabase
    .from("frases")
    .insert({ paquete: id, texto: "Escribe aquí tu primera frase.", orden: 1 });

  refrescar();
  return { ok: `«${nombre}» creada. Edítala aquí abajo.` };
}

/**
 * Enciende o apaga una lista.
 *
 * Freno: no se puede apagar la última encendida. Si no, la pantalla de elegir
 * afirmaciones se quedaría sin nada que ofrecer.
 */
export async function cambiarVisibilidad(datos: FormData): Promise<void> {
  const supabase = await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activar = datos.get("activar") === "si";

  if (!activar) {
    const { data: activas } = await supabase
      .from("paquetes")
      .select("id")
      .eq("activo", true);
    if (!puedeApagarse((activas ?? []).map((p) => p.id), id)) return;
  }

  await supabase.from("paquetes").update({ activo: activar }).eq("id", id);
  refrescar();
}

/** Borrar arrastra sus frases; el mismo freno que apagar. */
export async function borrarLista(datos: FormData): Promise<void> {
  const supabase = await exigirAdmin();
  const id = String(datos.get("id") ?? "");

  const { data: activas } = await supabase
    .from("paquetes")
    .select("id")
    .eq("activo", true);

  if (!puedeApagarse((activas ?? []).map((p) => p.id), id)) return;

  await supabase.from("paquetes").delete().eq("id", id);
  refrescar();
}
