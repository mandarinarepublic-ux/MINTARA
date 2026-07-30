"use server";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "../permisos";
import { CATALOGO, GRUPOS, type Clave } from "@/lib/textos/catalogo";
import { clavesValidas } from "@/lib/textos/mezcla";

export type EstadoTextos = { error?: string; ok?: string };

/** Las rutas donde puede salir un texto, para refrescarlas al guardar. */
function rutasDe(claves: string[]): string[] {
  const rutas = new Set<string>();
  for (const grupo of GRUPOS) {
    if (grupo.claves.some((c) => claves.includes(c))) rutas.add(grupo.ruta);
  }
  return [...rutas];
}

/**
 * Guarda los textos de un grupo que de verdad cambiaron.
 *
 * Solo se tocan los que cambiaron: así el botón de deshacer sigue apuntando a
 * la versión anterior de verdad. Si se guardaran todos cada vez, el "valor
 * anterior" pasaría a ser el mismo valor actual y deshacer no haría nada.
 */
export async function guardarTextos(
  _previo: EstadoTextos,
  datos: FormData,
): Promise<EstadoTextos> {
  const supabase = await exigirAdmin();

  const cambios: { clave: Clave; valor: string }[] = [];

  for (const [campo, valor] of datos.entries()) {
    if (!campo.startsWith("texto:")) continue;
    const clave = campo.slice("texto:".length);
    if (!clavesValidas(clave)) continue;

    const nuevo = String(valor).trim();
    if (nuevo.length === 0) {
      return {
        error: `«${CATALOGO[clave].etiqueta}» no puede quedar vacío.`,
      };
    }
    cambios.push({ clave, valor: nuevo });
  }

  if (cambios.length === 0) return { error: "No llegó ningún texto." };

  const { data: actuales } = await supabase
    .from("textos_pantalla")
    .select("clave, valor")
    .in(
      "clave",
      cambios.map((c) => c.clave),
    );

  const guardado = new Map((actuales ?? []).map((f) => [f.clave, f.valor]));

  /** Lo que la app está mostrando ahora mismo para esa clave. */
  const loQueSeVeHoy = (clave: Clave) =>
    guardado.get(clave) ?? CATALOGO[clave].porDefecto;

  const porEscribir = cambios.filter((c) => c.valor !== loQueSeVeHoy(c.clave));

  if (porEscribir.length === 0) return { ok: "No había nada que cambiar." };

  const filas = porEscribir.map((c) => ({
    clave: c.clave,
    valor: c.valor,
    valor_anterior: loQueSeVeHoy(c.clave),
    actualizado_en: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("textos_pantalla")
    .upsert(filas, { onConflict: "clave" });

  if (error) return { error: `No se pudo guardar: ${error.message}` };

  for (const ruta of rutasDe(porEscribir.map((c) => c.clave))) {
    revalidatePath(ruta);
  }
  revalidatePath("/admin/textos");

  const cuantos = porEscribir.length;
  return {
    ok: cuantos === 1 ? "Guardado, ya está en la app." : `${cuantos} textos guardados.`,
  };
}

/**
 * Devuelve un texto a como estaba antes del último cambio.
 *
 * Si no hay versión anterior guardada, se borra la fila: sin fila, la app usa
 * el texto original del código, que es exactamente "como estaba" al principio.
 */
export async function deshacerTexto(datos: FormData): Promise<void> {
  const supabase = await exigirAdmin();
  const clave = String(datos.get("clave") ?? "");
  if (!clavesValidas(clave)) return;

  const { data: fila } = await supabase
    .from("textos_pantalla")
    .select("valor, valor_anterior")
    .eq("clave", clave)
    .maybeSingle();

  if (!fila) return;

  if (fila.valor_anterior && fila.valor_anterior.trim().length > 0) {
    await supabase
      .from("textos_pantalla")
      .update({
        valor: fila.valor_anterior,
        // Deshacer dos veces seguidas no debe ir y venir para siempre: tras
        // volver atrás, ya no queda nada anterior a lo que volver.
        valor_anterior: null,
        actualizado_en: new Date().toISOString(),
      })
      .eq("clave", clave);
  } else {
    await supabase.from("textos_pantalla").delete().eq("clave", clave);
  }

  for (const ruta of rutasDe([clave])) revalidatePath(ruta);
  revalidatePath("/admin/textos");
}
