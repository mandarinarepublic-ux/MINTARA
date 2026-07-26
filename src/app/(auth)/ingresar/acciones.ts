"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { normalizarCelular } from "@/lib/telefono";

export type EstadoIngreso = { error?: string };

/**
 * Pide a Supabase Auth que genere el código de 6 dígitos.
 *
 * Supabase no lo manda por SMS: el hook "Send SMS" de este proyecto se lo
 * entrega a la Edge Function `enviar-otp-whatsapp`, que lo despacha por
 * WhatsApp con la plantilla de autenticación. Es el mismo camino que usa
 * La Mata de los Premios.
 */
export async function pedirCodigo(
  _previo: EstadoIngreso,
  datos: FormData,
): Promise<EstadoIngreso> {
  const celular = normalizarCelular(String(datos.get("celular") ?? ""));
  if (!celular) return { error: "Ese número no parece un celular de Ecuador." };

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithOtp({ phone: celular });

  if (error) {
    return { error: "No pudimos enviar el código. Inténtalo de nuevo en un minuto." };
  }

  redirect(`/verificar?celular=${encodeURIComponent(celular)}`);
}
