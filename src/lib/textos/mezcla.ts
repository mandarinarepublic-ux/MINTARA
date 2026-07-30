import { CATALOGO, type Clave, type Textos } from "./catalogo.ts";

/**
 * Junta el texto original del código con lo que se cambió desde el panel.
 *
 * La regla es una sola: **lo guardado gana, y lo que falte sale del código**.
 * De ahí sale la promesa de que la app nunca muestra un hueco, pase lo que
 * pase con la base.
 *
 * Es una función pura a propósito: no sabe de Supabase ni de red, así que se
 * puede probar entera sin levantar nada.
 */
export function mezclarTextos(guardados: Record<string, string>): Textos {
  const salida = {} as Textos;

  for (const [clave, entrada] of Object.entries(CATALOGO)) {
    const guardado = guardados[clave];
    // Un guardado en blanco no puede dejar muda una pantalla. El panel ya
    // impide guardarlo, pero si una fila queda así por cualquier motivo, aquí
    // se cae de pie.
    const sirve = typeof guardado === "string" && guardado.trim().length > 0;
    salida[clave as Clave] = sirve ? guardado : entrada.porDefecto;
  }

  return salida;
}

/** Si una clave ya no existe en el código, lo que quede en la base se ignora. */
export function clavesValidas(clave: string): clave is Clave {
  return clave in CATALOGO;
}

/** Lo que se muestra mientras no haya nada guardado o la base no responda. */
export function textosPorDefecto(): Textos {
  return mezclarTextos({});
}
