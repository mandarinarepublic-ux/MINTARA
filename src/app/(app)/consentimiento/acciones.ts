"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";

export async function aceptarConsentimiento(datos: FormData): Promise<void> {
  const volverA = String(datos.get("volverA") ?? "/estudio");
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  await supabase
    .from("perfiles")
    .update({ consentimiento_en: new Date().toISOString() })
    .eq("id", user.id);

  // Solo rutas internas: un `volverA` con http:// convertiría esta pantalla
  // en un trampolín para mandar gente a sitios ajenos.
  redirect(volverA.startsWith("/") ? volverA : "/estudio");
}
