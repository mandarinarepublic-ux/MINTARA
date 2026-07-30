"use client";
import { useActionState } from "react";
import { ocultarCelular } from "@/lib/telefono";
import { ocultarCorreo } from "@/lib/correo";
import { agregarCorreo, type EstadoVinculo } from "./acciones";

/**
 * Juntar las dos formas de entrar en una sola cuenta.
 *
 * Para Supabase, un celular y un correo son identidades distintas: entrar por
 * correo teniendo cuenta por WhatsApp crea una cuenta nueva y vacía. Esto es
 * lo que deja tener las dos apuntando a los mismos audios.
 *
 * Solo se ofrece agregar el correo. Agregar un celular a una cuenta que nació
 * por correo hace falta también, pero pide mandar un código por WhatsApp y
 * verificarlo, que es otra pantalla; queda anotado en el handoff.
 */
export function ComoEntras({
  celular,
  correo,
  puedeAgregarCorreo,
}: {
  celular: string | null;
  correo: string | null;
  puedeAgregarCorreo: boolean;
}) {
  const [estado, accion, pendiente] = useActionState<EstadoVinculo, FormData>(
    agregarCorreo,
    {},
  );

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-lavanda-100/15 bg-white/5 p-[18px]">
      <p className="etiqueta text-lavanda-100/60">Cómo entras</p>

      <ul className="flex flex-col gap-1.5 text-[14px] text-lavanda-100/80">
        {celular && (
          <li className="mono">📱 {ocultarCelular(celular)}</li>
        )}
        {correo && <li>✉️ {ocultarCorreo(correo)}</li>}
      </ul>

      {correo ? (
        <p className="text-[13px] text-lavanda-100/55">
          Puedes entrar con cualquiera de los dos y ver los mismos audios.
        </p>
      ) : puedeAgregarCorreo ? (
        <form action={accion} className="mt-1 flex flex-col gap-2">
          <p className="text-[13px] text-lavanda-100/70">
            Agrega tu correo y podrás entrar también con él, a esta misma
            cuenta y a los mismos audios.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              name="correo"
              type="email"
              inputMode="email"
              placeholder="tunombre@correo.com"
              required
              className="min-w-[180px] flex-1 rounded-[14px] border border-lavanda-100/20 bg-violeta-900/70 px-4 py-2.5 text-[14px] text-crema-50 placeholder:text-lavanda-100/30 focus:border-rosa-400 focus:outline-none"
            />
            <button
              disabled={pendiente}
              className="rounded-full bg-lavanda-100 px-5 py-2.5 text-[14px] font-semibold text-violeta-600 transition hover:bg-crema-50 active:scale-[0.97] disabled:opacity-40"
            >
              {pendiente ? "Enviando…" : "Agregar"}
            </button>
          </div>

          {estado.error && <p className="text-sm text-rosa-400">{estado.error}</p>}
          {estado.ok && <p className="text-sm text-menta-400">{estado.ok}</p>}
        </form>
      ) : null}
    </div>
  );
}
