import { obtenerTextos } from "@/lib/textos/servidor";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { agruparPorFamilia, type Ambiente, type Familia } from "@/lib/ambientes";
import {
  Hero,
  ComoFunciona,
  Ambientes,
  Privacidad,
  Precios,
  Cierre,
  Pie,
} from "./(publico)/Secciones";

/**
 * Las familias que se anuncian en la portada salen de la base, no de una
 * lista escrita a mano.
 *
 * Antes eran tres tarjetas fijas —Lluvia, Río, Mar— y por eso la portada
 * terminó prometiendo ambientes que ya no eran los que había: subir uno nuevo
 * desde el panel no cambiaba nada aquí. Leyéndolas, la portada se mantiene
 * sola. Si la consulta falla, la sección no se pinta: mejor una portada más
 * corta que una que miente.
 */
async function familiasAnunciadas() {
  try {
    const supabase = await supabaseServidor();
    const [{ data: familias }, { data: ambientes }] = await Promise.all([
      supabase.from("familias").select("*").order("orden"),
      supabase.from("ambientes").select("*").order("orden"),
    ]);
    return agruparPorFamilia(
      (familias ?? []) as Familia[],
      (ambientes ?? []) as Ambiente[],
    );
  } catch {
    return [];
  }
}

export default async function Portada() {
  const [t, familias] = await Promise.all([obtenerTextos(), familiasAnunciadas()]);

  return (
    <>
      <Hero t={t} />
      <ComoFunciona t={t} />
      <Ambientes familias={familias} />
      <Privacidad t={t} />
      <Precios familias={familias} />
      <Cierre t={t} />
      <Pie t={t} />
    </>
  );
}
