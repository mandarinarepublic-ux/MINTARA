import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { planEfectivo, PRECIOS, type Plan } from "@/lib/planes";
import { obtenerTextos } from "@/lib/textos/servidor";
import { pedirDesbloqueo } from "../cuenta/acciones";
import { Contenido, beneficiosPremium } from "./Contenido";

/**
 * Pantalla Premium (handoff 3.5).
 *
 * El handoff listaba también "la IA mejora tus afirmaciones" como beneficio.
 * No aparece aquí a propósito: esa función se decidió dejar fuera, y prometer
 * en la pantalla de pago algo que la app no hace es la peor forma de perder
 * a alguien que acaba de pagar.
 */
export default async function Premium() {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan, rol")
    .eq("id", user.id)
    .single();

  const plan = planEfectivo((perfil?.plan ?? "gratis") as Plan, perfil?.rol);
  if (plan === "premium") redirect("/audios");

  const t = await obtenerTextos();

  return (
    <Contenido
      t={t}
      beneficios={beneficiosPremium(t)}
      precioAnual={PRECIOS.anual.monto}
      precioMensual={PRECIOS.mensual.monto}
      accion={pedirDesbloqueo}
    />
  );
}
