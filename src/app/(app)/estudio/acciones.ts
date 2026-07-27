"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { puedeGrabar, planEfectivo, type Plan } from "@/lib/planes";

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

  // El tope se revisa aquí y no en la pantalla: una pantalla se puede
  // saltar, una server action no.
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan, rol")
    .eq("id", user.id)
    .single();

  const { count } = await supabase
    .from("grabaciones")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", user.id);

  if (!puedeGrabar(planEfectivo((perfil?.plan ?? "gratis") as Plan, perfil?.rol), count ?? 0)) {
    return {
      error: "Ya usaste tu grabación gratis. Desbloquea más desde tu cuenta.",
    };
  }

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
