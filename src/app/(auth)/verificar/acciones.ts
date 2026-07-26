"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type EstadoVerificacion = { error?: string };

export async function validarCodigo(
  _previo: EstadoVerificacion,
  datos: FormData,
): Promise<EstadoVerificacion> {
  const celular = String(datos.get("celular") ?? "");
  const codigo = String(datos.get("codigo") ?? "").trim();

  if (!/^\d{6}$/.test(codigo)) return { error: "El código son 6 números." };

  const supabase = await supabaseServidor();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: celular,
    token: codigo,
    type: "sms",
  });

  if (error || !data.user) return { error: "Ese código no es válido o ya venció." };

  // Alta del perfil la primera vez. Sin esto la persona entra, pero no
  // existe para la app: no tiene plan, ni consentimiento, ni nada colgando.
  const { error: falloPerfil } = await supabase
    .from("perfiles")
    .upsert({ id: data.user.id, celular }, { onConflict: "id" });

  if (falloPerfil) {
    return { error: "Entraste, pero no pudimos abrir tu perfil. Inténtalo otra vez." };
  }

  // Quien ya grabó algo espera encontrarlo, no una pantalla en blanco para
  // empezar de cero.
  const { count } = await supabase
    .from("grabaciones")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", data.user.id);

  redirect(count && count > 0 ? "/audios" : "/estudio");
}
