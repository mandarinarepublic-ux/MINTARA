"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirAdmin } from "./permisos";

/**
 * Sube el audio al almacén y devuelve su ruta.
 *
 * Lo sube el SERVIDOR con permisos de servicio, no el navegador. El intento
 * anterior dejaba que el navegador subiera directo, apoyándose en una regla
 * de la base que comprobaba el rol consultando otra tabla protegida; esa
 * comprobación no se resuelve dentro del almacén y rechazaba todas las
 * subidas. Con este camino la única comprobación de permisos es
 * `exigirAdmin`, que ya está aquí arriba y es fácil de auditar.
 */
async function subirAudio(archivo: File, familia: string): Promise<string> {
  if (!archivo.type.startsWith("audio/")) {
    throw new Error("Ese archivo no es un audio.");
  }
  if (archivo.size > 12 * 1024 * 1024) {
    throw new Error("Pesa más de 12 MB. Recórtalo a 60-90 segundos.");
  }

  // Nombre estable y sin sorpresas: sin tildes, espacios ni mayúsculas.
  const limpio = archivo.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.]+/g, "-");
  const ruta = `${familia}/${Date.now()}-${limpio}`;

  const { error } = await supabaseAdmin()
    .storage.from("fondos")
    .upload(ruta, archivo, { contentType: archivo.type, upsert: true });

  if (error) throw new Error(`No se pudo subir el audio: ${error.message}`);
  return ruta;
}

export type EstadoAdmin = { error?: string; ok?: string };

const Ambiente = z.object({
  familia: z.string().min(1),
  nombre: z.string().trim().min(1).max(60),
  ruta: z.string().trim().min(1),
  gratis: z.boolean(),
  activo: z.boolean(),
  orden: z.number().int().min(0).max(999),
});

export async function crearAmbiente(
  _previo: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  const supabase = await exigirAdmin();

  const familia = String(datos.get("familia") ?? "");
  const archivo = datos.get("audio");

  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Elige el archivo de audio antes de guardar." };
  }

  let ruta: string;
  try {
    ruta = await subirAudio(archivo, familia);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir el audio." };
  }

  const revisado = Ambiente.safeParse({
    familia,
    nombre: String(datos.get("nombre") ?? ""),
    ruta,
    gratis: datos.get("gratis") === "on",
    activo: true,
    orden: Number(datos.get("orden") ?? 0),
  });

  if (!revisado.success) {
    return { error: "Revisa el nombre: hace falta y no puede pasar de 60 letras." };
  }

  const { error } = await supabase.from("ambientes").insert(revisado.data);
  if (error) return { error: `No se pudo guardar: ${error.message}` };

  revalidatePath("/admin");
  return { ok: `"${revisado.data.nombre}" quedó listo.` };
}

export async function editarAmbiente(
  _previo: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  const supabase = await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return { error: "Falta el ambiente a editar." };

  const cambios: Record<string, unknown> = {
    nombre: String(datos.get("nombre") ?? "").trim(),
    gratis: datos.get("gratis") === "on",
    activo: datos.get("activo") === "on",
    orden: Number(datos.get("orden") ?? 0),
  };

  // Mover un audio de familia: la asignación inicial casi nunca es la buena.
  const familiaNueva = String(datos.get("familia") ?? "").trim();
  if (familiaNueva) cambios.familia = familiaNueva;

  // El audio solo cambia si se eligió uno nuevo; si no, se conserva el que ya
  // tenía. Así "guardar" tras cambiar solo el nombre no deja el ambiente mudo.
  const archivo = datos.get("audio");
  if (archivo instanceof File && archivo.size > 0) {
    try {
      cambios.ruta = await subirAudio(archivo, String(datos.get("familia") ?? "otros"));
    } catch (e) {
      return { error: e instanceof Error ? e.message : "No se pudo subir el audio." };
    }
  }

  if (!cambios.nombre) return { error: "El nombre no puede quedar vacío." };

  const { error } = await supabase.from("ambientes").update(cambios).eq("id", id);
  if (error) return { error: `No se pudo guardar: ${error.message}` };

  revalidatePath("/admin");
  return { ok: "Guardado." };
}

export async function borrarAmbiente(datos: FormData): Promise<void> {
  const supabase = await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (id) await supabase.from("ambientes").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function editarFamilia(
  _previo: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  const supabase = await exigirAdmin();
  const slug = String(datos.get("slug") ?? "");
  const nombre = String(datos.get("nombre") ?? "").trim();
  const descripcion = String(datos.get("descripcion") ?? "").trim();

  if (!slug || !nombre || !descripcion) {
    return { error: "El nombre y la frase de la familia son obligatorios." };
  }

  const { error } = await supabase
    .from("familias")
    .update({
      nombre,
      descripcion,
      orden: Number(datos.get("orden") ?? 0),
      activa: datos.get("activa") === "on",
    })
    .eq("slug", slug);

  if (error) return { error: `No se pudo guardar: ${error.message}` };

  revalidatePath("/admin");
  return { ok: "Familia actualizada." };
}
