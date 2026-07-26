"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServidor } from "@/lib/supabase/servidor";

const Entrada = z.object({
  nombre: z.string().trim().min(1).max(60),
  frases: z.array(z.string().trim().min(1).max(120)).min(1).max(12),
});

export type EstadoTexto = { error?: string };

export async function guardarTexto(
  _previo: EstadoTexto,
  datos: FormData,
): Promise<EstadoTexto> {
  const crudo = {
    nombre: String(datos.get("nombre") ?? ""),
    frases: datos
      .getAll("frase")
      .map(String)
      .map((f) => f.trim())
      .filter((f) => f.length > 0),
  };

  const revisado = Entrada.safeParse(crudo);
  if (!revisado.success) {
    return { error: "Revisa el texto: hace falta al menos una frase y máximo doce." };
  }

  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data, error } = await supabase
    .from("textos")
    .insert({ perfil_id: user.id, ...revisado.data })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No pudimos guardar el texto. Inténtalo otra vez." };
  }

  redirect(`/grabar/${data.id}`);
}
