import { supabaseServidor } from "@/lib/supabase/servidor";
import { mezclarTextos, textosPorDefecto } from "./mezcla";
import type { Textos } from "./catalogo";

/**
 * Los textos de la app, listos para pintar.
 *
 * Se leen TODOS de una sola consulta, no uno por uno: son unas sesenta filas
 * diminutas y una segunda consulta por cada texto volvería la portada lenta
 * sin ganar nada.
 *
 * Si la lectura falla —la base caída, la red mal, RLS mal puesto— no se lanza
 * el error hacia arriba: se devuelven los textos del código. Que el cliente
 * vea la portada con el texto original es infinitamente mejor que verla rota
 * porque no se pudo leer una frase.
 */
export async function obtenerTextos(): Promise<Textos> {
  try {
    const supabase = await supabaseServidor();
    const { data, error } = await supabase
      .from("textos_pantalla")
      .select("clave, valor");

    if (error || !data) return textosPorDefecto();

    const guardados: Record<string, string> = {};
    for (const fila of data) guardados[fila.clave] = fila.valor;

    return mezclarTextos(guardados);
  } catch {
    return textosPorDefecto();
  }
}

/** Lo que necesita el panel: además del valor, si se puede deshacer. */
export type TextoEditable = {
  clave: string;
  valor: string;
  original: string;
  sePuedeDeshacer: boolean;
};

export async function obtenerTextosParaEditar(): Promise<
  Record<string, { valor: string; valorAnterior: string | null }>
> {
  const supabase = await supabaseServidor();
  const { data } = await supabase
    .from("textos_pantalla")
    .select("clave, valor, valor_anterior");

  const salida: Record<string, { valor: string; valorAnterior: string | null }> =
    {};
  for (const fila of data ?? []) {
    salida[fila.clave] = { valor: fila.valor, valorAnterior: fila.valor_anterior };
  }
  return salida;
}
