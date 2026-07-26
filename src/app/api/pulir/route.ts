import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { proveedorElegido } from "@/lib/pulido/elegido";

/**
 * El pulido puede tardar más de un minuto para una lectura larga. Con el
 * plan Pro de Vercel se puede pedir hasta 300 s; con el valor por defecto
 * la petición se cortaría a la mitad y la grabación quedaría colgada en
 * "puliendo" para siempre.
 */
export const maxDuration = 300;

export async function POST(peticion: Request) {
  const { grabacionId } = (await peticion.json()) as { grabacionId?: string };
  if (!grabacionId) {
    return NextResponse.json({ error: "Falta grabacionId" }, { status: 400 });
  }

  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

  // Se lee con el cliente del usuario: RLS garantiza que la grabación es
  // suya. Recién después se usa el cliente admin, que salta RLS.
  const { data: grabacion } = await supabase
    .from("grabaciones")
    .select("id, estado, ruta_cruda")
    .eq("id", grabacionId)
    .single();

  if (!grabacion?.ruta_cruda) {
    return NextResponse.json({ error: "Grabación no encontrada" }, { status: 404 });
  }
  if (grabacion.estado === "lista") {
    return NextResponse.json({ estado: "lista" });
  }

  const admin = supabaseAdmin();
  await admin
    .from("grabaciones")
    .update({ estado: "puliendo", error: null, actualizado_en: new Date().toISOString() })
    .eq("id", grabacionId);

  const { data: archivo, error: falloDescarga } = await admin.storage
    .from("voces")
    .download(grabacion.ruta_cruda);

  if (falloDescarga || !archivo) {
    await admin
      .from("grabaciones")
      .update({ estado: "fallida", error: "No se pudo leer la grabación" })
      .eq("id", grabacionId);
    return NextResponse.json({ estado: "fallida" }, { status: 500 });
  }

  const resultado = await proveedorElegido().pulir(archivo, archivo.type);

  if (!resultado.ok) {
    await admin
      .from("grabaciones")
      .update({ estado: "fallida", error: resultado.motivo.slice(0, 500) })
      .eq("id", grabacionId);
    return NextResponse.json({ estado: "fallida" }, { status: 502 });
  }

  const rutaMaster = grabacion.ruta_cruda.replace(/cruda\.\w+$/, "master.mp3");
  const { error: falloSubida } = await admin.storage
    .from("voces")
    .upload(rutaMaster, resultado.audio, {
      contentType: resultado.tipo,
      upsert: true,
    });

  if (falloSubida) {
    await admin
      .from("grabaciones")
      .update({ estado: "fallida", error: "No se pudo guardar la voz limpia" })
      .eq("id", grabacionId);
    return NextResponse.json({ estado: "fallida" }, { status: 500 });
  }

  // La toma cruda ya no hace falta y es la más comprometedora: se borra.
  await admin.storage.from("voces").remove([grabacion.ruta_cruda]);

  await admin
    .from("grabaciones")
    .update({
      estado: "lista",
      ruta_master: rutaMaster,
      ruta_cruda: null,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", grabacionId);

  return NextResponse.json({ estado: "lista" });
}
