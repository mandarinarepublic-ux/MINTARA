"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type EstadoVerificacion = { error?: string };

/**
 * Comprueba el código, sea que llegó por WhatsApp o por correo.
 *
 * Los dos caminos terminan aquí a propósito: para quien usa la app es la
 * misma pantalla y el mismo gesto, y para el código es una sola ruta que
 * mantener.
 */
export async function validarCodigo(
  _previo: EstadoVerificacion,
  datos: FormData,
): Promise<EstadoVerificacion> {
  const celular = String(datos.get("celular") ?? "");
  const correo = String(datos.get("correo") ?? "");
  const codigo = String(datos.get("codigo") ?? "").trim();

  if (!/^\d{6}$/.test(codigo)) return { error: "El código son 6 números." };
  if (!celular && !correo) redirect("/ingresar");

  const supabase = await supabaseServidor();

  const { data, error } = correo
    ? await supabase.auth.verifyOtp({ email: correo, token: codigo, type: "email" })
    : await supabase.auth.verifyOtp({ phone: celular, token: codigo, type: "sms" });

  if (error || !data.user) return { error: "Ese código no es válido o ya venció." };

  // Alta del perfil la primera vez. Sin esto la persona entra, pero no
  // existe para la app: no tiene plan, ni consentimiento, ni nada colgando.
  //
  // Se guarda lo que traiga la sesión, no solo por lo que entró: quien ya
  // juntó su celular y su correo tiene los dos, y el perfil debe reflejarlo.
  const { error: falloPerfil } = await supabase.from("perfiles").upsert(
    {
      id: data.user.id,
      celular: data.user.phone || celular || null,
      correo: data.user.email || correo || null,
    },
    { onConflict: "id" },
  );

  if (falloPerfil) {
    return { error: "Entraste, pero no pudimos abrir tu perfil. Inténtalo otra vez." };
  }

  // Quien ya grabó algo espera encontrarlo, no una pantalla en blanco para
  // empezar de cero.
  const { count } = await supabase
    .from("grabaciones")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", data.user.id);

  if (count && count > 0) redirect("/audios");

  // Entró por correo y cayó en una cuenta recién nacida: puede que ya tuviera
  // otra por celular y esté a punto de creer que perdió sus audios.
  if (correo && !data.user.phone) redirect("/verificar/nuevo");

  redirect("/estudio");
}
