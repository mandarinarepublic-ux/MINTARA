"use client";
import { useActionState } from "react";
import { pedirCodigo, type EstadoIngreso } from "./acciones";

export default function Ingresar() {
  const [estado, accion, pendiente] = useActionState<EstadoIngreso, FormData>(
    pedirCodigo,
    {},
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-3xl font-semibold">Tu voz</h1>
        <p className="mt-2 text-neutral-500">
          Te mandamos un código por WhatsApp para entrar.
        </p>
      </div>

      <form action={accion} className="flex flex-col gap-4">
        <input
          name="celular"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="09XXXXXXXX"
          required
          className="rounded-xl border border-neutral-300 px-4 py-3 text-lg"
        />
        {estado.error && <p className="text-sm text-red-600">{estado.error}</p>}
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-xl bg-neutral-900 px-4 py-3 text-white disabled:opacity-50"
        >
          {pendiente ? "Enviando…" : "Enviarme el código"}
        </button>
      </form>
    </main>
  );
}
