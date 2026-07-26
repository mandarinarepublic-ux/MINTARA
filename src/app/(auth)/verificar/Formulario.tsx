"use client";
import { useActionState } from "react";
import { validarCodigo, type EstadoVerificacion } from "./acciones";
import { ocultarCelular } from "@/lib/telefono";

export function Formulario({ celular }: { celular: string }) {
  const [estado, accion, pendiente] = useActionState<EstadoVerificacion, FormData>(
    validarCodigo,
    {},
  );

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="celular" value={celular} />
      <p className="text-neutral-500">
        Mandamos el código al {ocultarCelular(celular)}
      </p>
      <input
        name="codigo"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        required
        className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-2xl tracking-[0.4em]"
      />
      {estado.error && <p className="text-sm text-red-600">{estado.error}</p>}
      <button
        type="submit"
        disabled={pendiente}
        className="rounded-xl bg-neutral-900 px-4 py-3 text-white disabled:opacity-50"
      >
        {pendiente ? "Comprobando…" : "Entrar"}
      </button>
    </form>
  );
}
