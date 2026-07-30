"use client";
import { useActionState, useState } from "react";
import { CATALOGO, type Clave, type Grupo, type Textos } from "@/lib/textos/catalogo";
import type { FormaDeEntrar } from "@/lib/ingreso";
import { guardarTextos, deshacerTexto, type EstadoTextos } from "./acciones";
import { VistaPrevia, anchoDe } from "./VistaPrevia";
import { Ventana } from "./Ventana";

/**
 * Editor de un grupo de textos, con la ventana de "así queda" al lado.
 *
 * El estado vive aquí para que la previsualización cambie mientras se escribe
 * y no al guardar: la idea es poder probar tres titulares sin que el cliente
 * vea ninguno.
 */
export function Editor({
  grupo,
  textos,
  sePuedeDeshacer,
  formas,
}: {
  grupo: Grupo;
  /** Lo que la app muestra hoy, ya mezclado. */
  textos: Textos;
  /** Claves que alguna vez se cambiaron y tienen a qué volver. */
  sePuedeDeshacer: string[];
  /** Las formas de entrar reales, para que la ventana no muestre de más. */
  formas: FormaDeEntrar[];
}) {
  const [borrador, setBorrador] = useState<Textos>(textos);
  const [estado, accion, pendiente] = useActionState<EstadoTextos, FormData>(
    guardarTextos,
    {},
  );

  const cambiado = grupo.claves.some((c) => borrador[c] !== textos[c]);
  const ancho = anchoDe(grupo.id);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      {/* ─────────────────── En el celular la ventana va arriba ─────────────────── */}
      <div className="order-1 lg:order-2">
        <p className="mb-2 text-[13px] text-lavanda-100/60">
          Así queda{" "}
          {cambiado && <span className="text-oro-500">· sin guardar</span>}
        </p>
        <Ventana anchoReal={ancho}>
          <VistaPrevia grupo={grupo.id} t={borrador} formas={formas} />
        </Ventana>
        <a
          href={grupo.ruta}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-[13px] text-rosa-400 hover:underline"
        >
          Ver la pantalla de verdad ↗
        </a>
      </div>

      {/* ────────────────────────────── Los campos ────────────────────────────── */}
      <form action={accion} className="order-2 flex flex-col gap-5 lg:order-1">
        {grupo.claves.map((clave) => (
          <Campo
            key={clave}
            clave={clave}
            valor={borrador[clave]}
            original={CATALOGO[clave].porDefecto}
            sePuedeDeshacer={sePuedeDeshacer.includes(clave)}
            alCambiar={(v) => setBorrador((b) => ({ ...b, [clave]: v }))}
          />
        ))}

        <div className="sticky bottom-0 flex flex-col gap-2 bg-violeta-700/95 py-3 backdrop-blur">
          {estado.error && <p className="text-sm text-rosa-400">{estado.error}</p>}
          {estado.ok && <p className="text-sm text-menta-400">{estado.ok}</p>}

          <button
            type="submit"
            disabled={pendiente || !cambiado}
            className="rounded-full bg-oro-500 px-6 py-3.5 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97] disabled:opacity-40"
          >
            {pendiente ? "Guardando…" : cambiado ? "Guardar" : "Sin cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({
  clave,
  valor,
  original,
  sePuedeDeshacer,
  alCambiar,
}: {
  clave: Clave;
  valor: string;
  original: string;
  sePuedeDeshacer: boolean;
  alCambiar: (v: string) => void;
}) {
  const entrada = CATALOGO[clave];
  const vacio = valor.trim().length === 0;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] text-crema-50">{entrada.etiqueta}</span>
      <span className="text-[12px] text-lavanda-100/55">{entrada.donde}</span>

      {entrada.largo === "parrafo" ? (
        <textarea
          name={`texto:${clave}`}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          rows={3}
          className={`resize-none rounded-[14px] border bg-white/5 px-4 py-3 text-[15px] leading-relaxed text-crema-50 focus:outline-none ${
            vacio ? "border-rosa-400" : "border-lavanda-100/15 focus:border-rosa-400"
          }`}
        />
      ) : (
        <input
          name={`texto:${clave}`}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          className={`rounded-[14px] border bg-white/5 px-4 py-3 text-[15px] text-crema-50 focus:outline-none ${
            vacio ? "border-rosa-400" : "border-lavanda-100/15 focus:border-rosa-400"
          }`}
        />
      )}

      {vacio && (
        <span className="text-[12px] text-rosa-400">
          Este texto no puede quedar vacío.
        </span>
      )}

      <span className="flex flex-wrap items-center gap-3">
        {sePuedeDeshacer && (
          <button
            type="submit"
            formAction={deshacerTexto}
            name="clave"
            value={clave}
            className="text-[12px] text-lavanda-100/60 hover:text-crema-50"
          >
            ↩ volver a como estaba
          </button>
        )}
        {valor !== original && (
          <span className="text-[12px] text-lavanda-100/40">
            Original: «{original}»
          </span>
        )}
      </span>
    </label>
  );
}
