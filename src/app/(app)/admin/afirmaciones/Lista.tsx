"use client";
import { useActionState, useState } from "react";
import { moverFrase, quitarFrase, frasesUtiles } from "@/lib/afirmaciones/edicion";
import {
  guardarLista,
  cambiarVisibilidad,
  borrarLista,
  type EstadoAfirmaciones,
} from "./acciones";

export type ListaEditable = {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  frases: string[];
};

export function Lista({
  lista,
  esLaUnicaActiva,
}: {
  lista: ListaEditable;
  esLaUnicaActiva: boolean;
}) {
  const [nombre, setNombre] = useState(lista.nombre);
  const [descripcion, setDescripcion] = useState(lista.descripcion);
  const [frases, setFrases] = useState(lista.frases);
  const [estado, accion, pendiente] = useActionState<EstadoAfirmaciones, FormData>(
    guardarLista,
    {},
  );

  function cambiar(i: number, valor: string) {
    setFrases((antes) => antes.map((f, j) => (j === i ? valor : f)));
  }

  const sinFrases = frasesUtiles(frases).length === 0;

  return (
    <section
      className={`flex flex-col gap-4 rounded-[22px] border px-5 py-5 ${
        lista.activo
          ? "border-lavanda-100/15 bg-white/5"
          : "border-lavanda-100/10 bg-white/[0.02] opacity-70"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="display text-[19px] text-crema-50">
          {nombre || "Sin nombre"}{" "}
          <span className="text-[13px] text-lavanda-100/50">
            · {frases.length} {frases.length === 1 ? "frase" : "frases"}
          </span>
        </h2>

        <div className="flex items-center gap-3">
          <form action={cambiarVisibilidad}>
            <input type="hidden" name="id" value={lista.id} />
            <input
              type="hidden"
              name="activar"
              value={lista.activo ? "no" : "si"}
            />
            <button
              disabled={lista.activo && esLaUnicaActiva}
              title={
                lista.activo && esLaUnicaActiva
                  ? "No puedes apagar la última lista encendida: la pantalla de elegir se quedaría vacía."
                  : undefined
              }
              className="text-[13px] text-lavanda-100/70 hover:text-crema-50 disabled:opacity-40"
            >
              {lista.activo ? "Apagar" : "Encender"}
            </button>
          </form>

          <form action={borrarLista}>
            <input type="hidden" name="id" value={lista.id} />
            <button
              disabled={lista.activo && esLaUnicaActiva}
              className="text-[13px] text-rosa-400 hover:underline disabled:opacity-40"
            >
              Borrar
            </button>
          </form>
        </div>
      </div>

      <form action={accion} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={lista.id} />

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-lavanda-100/70">
            Nombre · el botón que ve el cliente
          </span>
          <input
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-[14px] border border-lavanda-100/15 bg-white/5 px-4 py-2.5 text-[15px] text-crema-50 focus:border-rosa-400 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-lavanda-100/70">
            Para qué sirve · sale bajo los botones
          </span>
          <input
            name="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="rounded-[14px] border border-lavanda-100/15 bg-white/5 px-4 py-2.5 text-[15px] text-crema-50 focus:border-rosa-400 focus:outline-none"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-lavanda-100/70">
            Las frases, en el orden en que se leen
          </span>

          {frases.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                name="frase"
                value={f}
                onChange={(e) => cambiar(i, e.target.value)}
                rows={2}
                maxLength={120}
                className="display flex-1 resize-none rounded-[16px] border border-lavanda-100/15 bg-white/5 px-4 py-3 text-[16px] leading-relaxed text-crema-50 focus:border-rosa-400 focus:outline-none"
              />
              <div className="flex flex-col gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setFrases((a) => moverFrase(a, i, -1))}
                  disabled={i === 0}
                  aria-label="Subir esta frase"
                  className="text-[13px] text-lavanda-100/60 hover:text-crema-50 disabled:opacity-25"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => setFrases((a) => moverFrase(a, i, 1))}
                  disabled={i === frases.length - 1}
                  aria-label="Bajar esta frase"
                  className="text-[13px] text-lavanda-100/60 hover:text-crema-50 disabled:opacity-25"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setFrases((a) => quitarFrase(a, i))}
                  aria-label="Quitar esta frase"
                  className="text-[13px] text-rosa-400 hover:underline"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setFrases((a) => [...a, ""])}
            className="self-start text-[13px] text-rosa-400 hover:underline"
          >
            Agregar una frase
          </button>
        </div>

        {sinFrases && (
          <p className="text-sm text-rosa-400">
            Una lista no puede quedarse sin frases.
          </p>
        )}
        {estado.error && <p className="text-sm text-rosa-400">{estado.error}</p>}
        {estado.ok && <p className="text-sm text-menta-400">{estado.ok}</p>}

        <button
          type="submit"
          disabled={pendiente || sinFrases}
          className="self-start rounded-full bg-oro-500 px-5 py-2.5 text-[14px] font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97] disabled:opacity-40"
        >
          {pendiente ? "Guardando…" : "Guardar esta lista"}
        </button>
      </form>
    </section>
  );
}
