"use client";
import { useState } from "react";
import { borrarAudios, borrarTodo } from "./acciones";

/**
 * Borrar, con la pregunta que faltaba.
 *
 * El 27-jul un solo toque borró una cuenta entera con su grabación, sin
 * preguntar nada y sin vuelta atrás. El diseño lo pedía desde el principio
 * ("debe pedir confirmación y borrar de verdad") y solo estaba hecha la
 * segunda mitad.
 *
 * Van separadas a propósito: querer empezar de cero con las grabaciones es
 * corriente; querer irse del todo es otra cosa. Meterlas en el mismo botón
 * hacía que un arrepentimiento pequeño costara la cuenta.
 */
export function ZonaPeligrosa({ audios }: { audios: number }) {
  const [confirmando, setConfirmando] = useState<null | "audios" | "cuenta">(null);

  if (confirmando) {
    const esCuenta = confirmando === "cuenta";
    return (
      <div className="flex flex-col gap-4 rounded-[18px] border border-rosa-400/50 bg-rosa-400/10 p-5">
        <div>
          <p className="display text-[19px] text-crema-50">
            {esCuenta ? "¿Borrar tu cuenta?" : "¿Borrar tus audios?"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-lavanda-100/85">
            {esCuenta ? (
              <>
                Se borra tu voz, {audios === 1 ? "tu audio" : `tus ${audios} audios`},
                tus textos y tu cuenta. Tendrías que empezar de cero, y
                <strong className="text-crema-50"> no hay forma de recuperarlo</strong>.
              </>
            ) : (
              <>
                Se borran {audios === 1 ? "tu audio" : `tus ${audios} audios`} y las
                grabaciones de tu voz. Tu cuenta sigue, pero
                <strong className="text-crema-50"> lo grabado no se recupera</strong>.
              </>
            )}
          </p>
        </div>

        <form action={esCuenta ? borrarTodo : borrarAudios} className="flex flex-col gap-2">
          <button className="rounded-full bg-rosa-400 px-6 py-3 font-semibold text-violeta-600 transition hover:brightness-110 active:scale-[0.97]">
            {esCuenta ? "Sí, borrar mi cuenta" : "Sí, borrar mis audios"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(null)}
            className="rounded-full border border-lavanda-100/30 px-6 py-3 text-crema-50 transition hover:border-crema-50"
          >
            No, dejarlo como está
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-lavanda-100/15 bg-white/5 p-5">
      <p className="etiqueta text-lavanda-100/60">Borrar</p>
      <button
        onClick={() => setConfirmando("audios")}
        disabled={audios === 0}
        className="self-start text-[14px] text-lavanda-100/80 hover:text-crema-50 disabled:opacity-40"
      >
        Borrar mis audios
      </button>
      <button
        onClick={() => setConfirmando("cuenta")}
        className="self-start text-[14px] text-rosa-400 hover:underline"
      >
        Borrar mi cuenta para siempre
      </button>
    </div>
  );
}
