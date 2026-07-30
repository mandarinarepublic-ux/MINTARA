"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { leerEntorno } from "@/lib/entorno";
import { normalizarCorreo } from "@/lib/correo";
import { hayCorreo } from "@/lib/ingreso";

export type EstadoVinculo = { error?: string; ok?: string };

/**
 * Agrega un correo a una cuenta que nació por celular.
 *
 * Las dos identidades quedan colgando del MISMO usuario, así que después se
 * puede entrar por cualquiera de las dos y salen los mismos audios. Está
 * comprobado en esta base: el usuario `eaacdd90` tiene una identidad `phone`
 * del 22-jul 04:03 y una `email` del 22-jul 04:24.
 *
 * Supabase manda un correo de confirmación al nuevo buzón. Hasta que la
 * persona lo confirme, el correo no queda pegado a la cuenta — por eso el
 * mensaje pide ir a revisarlo.
 */
export async function agregarCorreo(
  _previo: EstadoVinculo,
  datos: FormData,
): Promise<EstadoVinculo> {
  if (!hayCorreo()) {
    return { error: "Por ahora solo se puede entrar con el celular." };
  }

  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const correo = normalizarCorreo(String(datos.get("correo") ?? ""));
  if (!correo) return { error: "Ese correo no parece estar bien escrito." };

  const { error } = await supabase.auth.updateUser({ email: correo });

  if (error) {
    // El caso que más va a pasar: ese correo ya es de otra cuenta.
    const yaUsado = /already|registered|exists/i.test(error.message);
    return {
      error: yaUsado
        ? "Ese correo ya está en otra cuenta. Entra con él."
        : "No pudimos agregarlo. Inténtalo de nuevo en un minuto.",
    };
  }

  revalidatePath("/cuenta");
  return {
    ok: `Te mandamos un correo a ${correo}. Ábrelo para confirmarlo y listo.`,
  };
}

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
