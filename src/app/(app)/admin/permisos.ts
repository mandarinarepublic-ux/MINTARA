import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";

/**
 * Todas las acciones del panel comprueban el rol contra la base, no contra lo
 * que diga la pantalla. Las políticas de la base ya bloquean a quien no es
 * admin, pero fallar aquí da un mensaje claro en vez de un error críptico de
 * permisos.
 *
 * Vive en su propio archivo para que lo compartan los tres grupos de acciones
 * del panel —ambientes, textos y afirmaciones— sin copiarlo tres veces.
 */
export async function exigirAdmin() {
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
