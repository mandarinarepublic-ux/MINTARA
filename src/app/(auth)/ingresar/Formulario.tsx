"use client";
import { useActionState } from "react";
import Image from "next/image";
import type { Textos } from "@/lib/textos/catalogo";
import { pedirCodigo, type EstadoIngreso } from "./acciones";

/**
 * La parte que necesita estado vive aquí; los textos llegan ya resueltos
 * desde la página, que sí puede leer la base.
 */
export function Formulario({ t }: { t: Textos }) {
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
          {t["ingresar.eslogan"]}
        </p>
      </div>

      <div className="flex flex-col gap-[18px] rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[22px] py-[26px]">
        <div className="flex flex-col gap-2">
          <h2 className="display text-[22px] text-crema-50">
            {t["ingresar.titulo"]}
          </h2>
          <p className="text-sm leading-relaxed text-lavanda-100/70">
            {t["ingresar.cuerpo"]}
          </p>
        </div>

        <form action={accion} className="flex flex-col gap-[18px]">
          <label className="flex flex-col gap-2">
            <span className="etiqueta text-lavanda-100/60">
              {t["ingresar.etiqueta_numero"]}
            </span>
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
            {pendiente ? t["ingresar.boton_enviando"] : t["ingresar.boton"]}
          </button>
        </form>
      </div>

      <p className="text-center text-xs leading-relaxed text-lavanda-100/50">
        {t["ingresar.pie"]}
      </p>
    </main>
  );
}
