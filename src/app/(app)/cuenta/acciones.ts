"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { leerEntorno } from "@/lib/entorno";

/**
 * Pago manual mientras se valida el producto: se manda a la persona a un
 * link de dLocal y la cuenta se activa a mano. Construir facturación
 * automática antes de saber si la gente paga sería trabajo tirado.
 */
export async function pedirDesbloqueo(): Promise<void> {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  redirect(leerEntorno("LINK_PAGO") ?? "https://wa.me/593983745757");
}

/**
 * Borra todo: voces, textos y perfil. Sin retenciones de cortesía.
 *
 * Las tablas caen solas porque todo cuelga de `perfiles` con
 * `on delete cascade`; los archivos hay que borrarlos a mano, carpeta por
 * carpeta, porque Storage no tiene borrado recursivo.
 */
export async function borrarTodo(): Promise<void> {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: carpetas } = await supabase.storage
    .from("voces")
    .list(user.id, { limit: 100 });

  for (const carpeta of carpetas ?? []) {
    const { data: dentro } = await supabase.storage
      .from("voces")
      .list(`${user.id}/${carpeta.name}`, { limit: 100 });
    const rutas = (dentro ?? []).map((a) => `${user.id}/${carpeta.name}/${a.name}`);
    if (rutas.length) await supabase.storage.from("voces").remove(rutas);
  }

  await supabase.from("perfiles").delete().eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/");
}
