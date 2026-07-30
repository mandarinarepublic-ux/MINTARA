"use client";
import { useActionState } from "react";
import { crearLista, type EstadoAfirmaciones } from "./acciones";

export function Nueva() {
  const [estado, accion, pendiente] = useActionState<EstadoAfirmaciones, FormData>(
    crearLista,
    {},
  );

  return (
    <form
      action={accion}
      className="flex flex-col gap-3 rounded-[22px] border border-dashed border-lavanda-100/20 px-5 py-5"
    >
      <h2 className="display text-[17px] text-crema-50">Crear una lista nueva</h2>
      <p className="text-[13px] text-lavanda-100/60">
        Nace con una frase de ejemplo para que puedas guardarla desde el primer
        momento. Cámbiala y agrega las que quieras.
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          name="nombre"
          placeholder="Gratitud"
          required
          className="min-w-[200px] flex-1 rounded-[14px] border border-lavanda-100/15 bg-white/5 px-4 py-2.5 text-[15px] text-crema-50 placeholder:text-lavanda-100/30 focus:border-rosa-400 focus:outline-none"
        />
        <button
          disabled={pendiente}
          className="rounded-full bg-lavanda-100 px-5 py-2.5 text-[14px] font-semibold text-violeta-600 transition hover:bg-crema-50 active:scale-[0.97] disabled:opacity-40"
        >
          {pendiente ? "Creando…" : "Crear"}
        </button>
      </div>

      {estado.error && <p className="text-sm text-rosa-400">{estado.error}</p>}
      {estado.ok && <p className="text-sm text-menta-400">{estado.ok}</p>}
    </form>
  );
}
