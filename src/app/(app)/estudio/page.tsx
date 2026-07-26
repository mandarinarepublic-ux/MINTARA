"use client";
import { useActionState, useState } from "react";
import { PAQUETES } from "@/lib/afirmaciones/paquetes";
import { guardarTexto, type EstadoTexto } from "./acciones";

export default function Estudio() {
  const [paquete, setPaquete] = useState(PAQUETES[0]);
  const [frases, setFrases] = useState<string[]>(PAQUETES[0].frases);
  const [estado, accion, pendiente] = useActionState<EstadoTexto, FormData>(
    guardarTexto,
    {},
  );

  function elegir(id: string) {
    const p = PAQUETES.find((x) => x.id === id)!;
    setPaquete(p);
    setFrases(p.frases);
  }

  function cambiar(i: number, valor: string) {
    setFrases((antes) => antes.map((f, j) => (j === i ? valor : f)));
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-semibold">¿Qué quieres decirte?</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {PAQUETES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => elegir(p.id)}
            className={`rounded-full border px-4 py-2 text-sm ${
              p.id === paquete.id
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300"
            }`}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-neutral-500">{paquete.descripcion}</p>

      <form action={accion} className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="nombre" value={paquete.nombre} />
        {frases.map((f, i) => (
          <textarea
            key={i}
            name="frase"
            value={f}
            onChange={(e) => cambiar(i, e.target.value)}
            rows={2}
            maxLength={120}
            className="rounded-xl border border-neutral-300 px-4 py-3"
          />
        ))}
        <button
          type="button"
          onClick={() => setFrases((a) => (a.length < 12 ? [...a, ""] : a))}
          className="self-start text-sm text-neutral-500 underline"
        >
          Agregar una frase mía
        </button>

        {estado.error && <p className="text-sm text-red-600">{estado.error}</p>}
        <button
          type="submit"
          disabled={pendiente}
          className="mt-4 rounded-xl bg-neutral-900 px-4 py-3 text-white disabled:opacity-50"
        >
          {pendiente ? "Guardando…" : "Ya está, vamos a grabar"}
        </button>
      </form>
    </main>
  );
}
