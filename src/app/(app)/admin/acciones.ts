"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServidor } from "@/lib/supabase/servidor";

/**
 * Todas las acciones comprueban el rol contra la base, no contra lo que diga
 * la pantalla. Las políticas de la base ya bloquean a quien no es admin, pero
 * fallar aquí da un mensaje claro en vez de un error críptico de permisos.
 */
async function exigirAdmin() {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") redirect("/audios");
  return supabase;
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

  const revisado = Ambiente.safeParse({
    familia: String(datos.get("familia") ?? ""),
    nombre: String(datos.get("nombre") ?? ""),
    ruta: String(datos.get("ruta") ?? ""),
    gratis: datos.get("gratis") === "on",
    activo: true,
    orden: Number(datos.get("orden") ?? 0),
  });

  if (!revisado.success) {
    return { error: "Faltan datos: revisa el nombre y que el audio se haya subido." };
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

  // La ruta solo cambia si se subió un audio nuevo; si no, se conserva.
  const rutaNueva = String(datos.get("ruta") ?? "").trim();
  if (rutaNueva) cambios.ruta = rutaNueva;

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
