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
 * Borra los archivos de voz de alguien.
 *
 * Storage no tiene borrado recursivo, así que hay que recorrer carpeta por
 * carpeta. Se usa tanto para borrar solo los audios como para borrar la
 * cuenta entera.
 */
async function borrarArchivosDeVoz(
  supabase: Awaited<ReturnType<typeof supabaseServidor>>,
  usuarioId: string,
): Promise<void> {
  const { data: carpetas } = await supabase.storage
    .from("voces")
    .list(usuarioId, { limit: 100 });

  for (const carpeta of carpetas ?? []) {
    const { data: dentro } = await supabase.storage
      .from("voces")
      .list(`${usuarioId}/${carpeta.name}`, { limit: 100 });
    const rutas = (dentro ?? []).map(
      (a) => `${usuarioId}/${carpeta.name}/${a.name}`,
    );
    if (rutas.length) await supabase.storage.from("voces").remove(rutas);
  }
}

/**
 * Borra las grabaciones, pero deja la cuenta en pie.
 *
 * Existe porque querer empezar de cero con lo grabado es corriente, y antes
 * costaba la cuenta entera: el único botón que había borraba todo.
 */
export async function borrarAudios(): Promise<void> {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  await borrarArchivosDeVoz(supabase, user.id);
  await supabase.from("grabaciones").delete().eq("perfil_id", user.id);

  redirect("/audios");
}

/**
 * Borra todo: voces, textos, grabaciones y cuenta. Sin retenciones de
 * cortesía y sin vuelta atrás.
 *
 * Las tablas caen solas porque todo cuelga de `perfiles` con
 * `on delete cascade`; los archivos hay que borrarlos a mano.
 */
export async function borrarTodo(): Promise<void> {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  await borrarArchivosDeVoz(supabase, user.id);
  await supabase.from("perfiles").delete().eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/");
}
