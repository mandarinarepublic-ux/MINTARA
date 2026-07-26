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
    <div className="flex flex-col gap-[18px] rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[22px] py-[26px]">
      <div className="flex flex-col gap-2">
        <h2 className="display text-[22px] text-crema-50">Tu código</h2>
        <p className="text-sm leading-relaxed text-lavanda-100/70">
          Lo mandamos por WhatsApp al {ocultarCelular(celular)}
        </p>
      </div>

      <form action={accion} className="flex flex-col gap-[18px]">
        <input type="hidden" name="celular" value={celular} />

        {/*
          El diseño pide seis casillas. Va un solo campo con las cifras muy
          separadas: se ve igual y deja que el celular pegue el código de
          WhatsApp de un toque, cosa que con seis campos sueltos se rompe.
        */}
        <input
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="······"
          required
          autoFocus
          className="mono rounded-[14px] border border-lavanda-100/20 bg-violeta-900/70 px-4 py-4 text-center text-[26px] tracking-[0.5em] text-crema-50 placeholder:text-lavanda-100/25 focus:border-rosa-400 focus:outline-none"
        />

        {estado.error && <p className="text-sm text-rosa-400">{estado.error}</p>}

        <button
          type="submit"
          disabled={pendiente}
          className="rounded-full bg-oro-500 px-6 py-3.5 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97] disabled:opacity-50"
        >
          {pendiente ? "Comprobando…" : "Entrar"}
        </button>

        <a
          href="/ingresar"
          className="text-center text-[13px] text-rosa-400 hover:underline"
        >
          Reenviar código
        </a>
      </form>
    </div>
  );
}
