"use client";
import { useActionState } from "react";
import Image from "next/image";
import { pedirCodigo, type EstadoIngreso } from "./acciones";

export default function Ingresar() {
  const [estado, accion, pendiente] = useActionState<EstadoIngreso, FormData>(
    pedirCodigo,
    {},
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col justify-center gap-9 px-[22px] py-10">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/marca/mintara-badge.png"
          alt="Míntara"
          width={88}
          height={88}
          priority
          className="flotar"
        />
        <h1 className="display text-[38px] leading-none text-crema-50">Míntara</h1>
        <p className="text-[10px] uppercase tracking-[0.24em] text-rosa-400">
          Tu voz · Tus palabras · Tu intención
        </p>
      </div>

      <div className="flex flex-col gap-[18px] rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[22px] py-[26px]">
        <div className="flex flex-col gap-2">
          <h2 className="display text-[22px] text-crema-50">Tu voz</h2>
          <p className="text-sm leading-relaxed text-lavanda-100/70">
            Te mandamos un código por WhatsApp para entrar. Sin contraseñas.
          </p>
        </div>

        <form action={accion} className="flex flex-col gap-[18px]">
          <label className="flex flex-col gap-2">
            <span className="etiqueta text-lavanda-100/60">Tu número</span>
            <span className="flex items-center gap-2 rounded-[14px] border border-lavanda-100/20 bg-violeta-900/70 px-4 py-[15px] focus-within:border-rosa-400">
              <span className="mono text-lavanda-100/60">+593</span>
              <input
                name="celular"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="98 374 5757"
                required
                className="mono w-full bg-transparent tracking-[0.06em] text-crema-50 placeholder:text-lavanda-100/30 focus:outline-none"
              />
            </span>
          </label>

          {estado.error && <p className="text-sm text-rosa-400">{estado.error}</p>}

          <button
            type="submit"
            disabled={pendiente}
            className="rounded-full bg-oro-500 px-6 py-3.5 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97] disabled:opacity-50"
          >
            {pendiente ? "Enviando…" : "Enviarme el código"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs leading-relaxed text-lavanda-100/50">
        Al entrar aceptas los términos. Tu voz no se comparte con nadie.
      </p>
    </main>
  );
}
