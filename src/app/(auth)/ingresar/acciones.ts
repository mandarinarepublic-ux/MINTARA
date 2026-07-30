"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { normalizarCelular } from "@/lib/telefono";
import { normalizarCorreo } from "@/lib/correo";
import { hayCorreo } from "@/lib/ingreso";

export type EstadoIngreso = { error?: string };

/**
 * Pide a Supabase Auth que genere el código de 6 dígitos.
 *
 * Por celular: Supabase no lo manda por SMS. El hook "Send SMS" de este
 * proyecto se lo entrega a la Edge Function `enviar-otp-whatsapp`, que lo
 * despacha por WhatsApp con la plantilla de autenticación. Es el mismo camino
 * que usa La Mata de los Premios.
 *
 * Por correo: lo manda Supabase por SMTP. ⚠️ La plantilla del correo tiene que
 * incluir `{{ .Token }}`; con la plantilla que viene por defecto se envía un
 * enlace en vez del código y la pantalla de verificar no sirve de nada.
 */
export async function pedirCodigo(
  _previo: EstadoIngreso,
  datos: FormData,
): Promise<EstadoIngreso> {
  const metodo = String(datos.get("metodo") ?? "celular");
  return metodo === "correo"
    ? pedirPorCorreo(String(datos.get("correo") ?? ""))
    : pedirPorCelular(String(datos.get("celular") ?? ""));
}

async function pedirPorCelular(crudo: string): Promise<EstadoIngreso> {
  const celular = normalizarCelular(crudo);
  if (!celular) return { error: "Ese número no parece un celular de Ecuador." };

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithOtp({ phone: celular });

  if (error) {
    return { error: "No pudimos enviar el código. Inténtalo de nuevo en un minuto." };
  }

  redirect(`/verificar?celular=${encodeURIComponent(celular)}`);
}

async function pedirPorCorreo(crudo: string): Promise<EstadoIngreso> {
  // Aunque la pestaña no se vea, alguien podría mandar el formulario a mano.
  if (!hayCorreo()) {
    return { error: "Por ahora solo se puede entrar con el celular." };
  }

  const correo = normalizarCorreo(crudo);
  if (!correo) return { error: "Ese correo no parece estar bien escrito." };

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithOtp({ email: correo });

  if (error) {
    return { error: "No pudimos enviar el código. Inténtalo de nuevo en un minuto." };
  }

  redirect(`/verificar?correo=${encodeURIComponent(correo)}`);
}
