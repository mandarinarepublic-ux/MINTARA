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
    <main className="mx-auto w-full max-w-[402px] px-[22px] py-10 md:max-w-[520px]">
      <a href="/audios" className="text-[15px] text-lavanda-100/70">
        ← Mis audios
      </a>
      <p className="etiqueta mt-6 text-lavanda-100/50">Paso 1 de 2</p>
      <h1 className="display mt-2 text-[28px] leading-tight text-crema-50">
        ¿Qué quieres decirte?
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {PAQUETES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => elegir(p.id)}
            className={`rounded-full border px-4 py-2 text-[13px] transition active:scale-[0.97] ${
              p.id === paquete.id
                ? "border-transparent bg-lavanda-100 text-violeta-600"
                : "border-lavanda-100/20 text-lavanda-100/80 hover:border-rosa-400 hover:text-rosa-400"
            }`}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[13px] text-lavanda-100/60">{paquete.descripcion}</p>

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
            className="display resize-none rounded-[18px] border border-lavanda-100/15 bg-white/5 px-4 py-3.5 text-[17px] leading-relaxed text-crema-50 focus:border-rosa-400 focus:outline-none"
          />
        ))}

        <button
          type="button"
          onClick={() => setFrases((a) => (a.length < 12 ? [...a, ""] : a))}
          className="self-start text-[13px] text-rosa-400 hover:underline"
        >
          Agregar una frase mía
        </button>

        {estado.error && <p className="text-sm text-rosa-400">{estado.error}</p>}

        <button
          type="submit"
          disabled={pendiente}
          className="mt-4 rounded-full bg-oro-500 px-6 py-3.5 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97] disabled:opacity-50"
        >
          {pendiente ? "Guardando…" : "Ya está, vamos a grabar"}
        </button>
      </form>
    </main>
  );
}
