"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  construirGuion,
  type FraseGuiada,
  type Intencion,
} from "@/lib/audio/interpretacion";

/**
 * La guía de interpretación.
 *
 * Todo el texto está a la vista, apagado. Al grabar, las palabras se van
 * encendiendo con el color de su intención, al ritmo sugerido.
 *
 * NO persigue a nadie: el relleno avanza dentro de la frase y, si llega al
 * final antes que la persona, se queda esperando ahí. Nunca hay error, ni
 * aviso, ni sensación de ir tarde — el texto es íntimo y grabarlo tiene que
 * seguir siendo tranquilo.
 */
const COLOR: Record<Intencion, string> = {
  suave: "text-menta-400",
  normal: "text-crema-50",
  fuerza: "text-oro-500",
};

export function Karaoke({
  frases,
  grabando,
  transcurridoMs,
}: {
  frases: string[];
  grabando: boolean;
  transcurridoMs: number;
}) {
  const guion = useMemo(() => construirGuion(frases), [frases]);
  const [avance, setAvance] = useState(0);
  const contenedor = useRef<HTMLDivElement | null>(null);

  // El avance se congela al final de cada frase hasta que su respiración
  // termina: así el relleno espera en el sitio donde uno toma aire.
  useEffect(() => {
    if (!grabando) {
      setAvance(0);
      return;
    }
    setAvance(transcurridoMs / 1000);
  }, [grabando, transcurridoMs]);

  const fraseActual = guion.findIndex(
    (f) => avance >= f.desdeSeg && avance < f.hastaSeg + 0.001,
  );

  // Mantener a la vista la frase que toca, sin saltos bruscos.
  useEffect(() => {
    if (fraseActual < 0) return;
    contenedor.current
      ?.querySelector(`[data-frase="${fraseActual}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [fraseActual]);

  return (
    <div
      ref={contenedor}
      className="flex max-h-[46dvh] flex-col gap-6 overflow-y-auto pr-1"
    >
      {guion.map((frase, i) => (
        <Frase
          key={i}
          indice={i}
          frase={frase}
          avance={avance}
          estado={
            !grabando
              ? "en-espera"
              : avance >= frase.hastaSeg
                ? "dicha"
                : i === fraseActual
                  ? "ahora"
                  : "en-espera"
          }
        />
      ))}
    </div>
  );
}

function Frase({
  indice,
  frase,
  avance,
  estado,
}: {
  indice: number;
  frase: FraseGuiada;
  avance: number;
  estado: "en-espera" | "ahora" | "dicha";
}) {
  return (
    <p
      data-frase={indice}
      className={`display text-[23px] leading-[1.5] transition-opacity duration-500 ${
        estado === "ahora" ? "opacity-100" : estado === "dicha" ? "opacity-45" : "opacity-25"
      }`}
    >
      {frase.palabras.map((palabra, j) => {
        // Una palabra se enciende cuando el relleno la alcanza; antes de eso
        // se ve, pero apagada.
        const encendida = avance >= palabra.desdeSeg;
        return (
          <span
            key={j}
            className={`transition-colors duration-200 ${
              encendida ? COLOR[palabra.intencion] : "text-lavanda-100/30"
            }`}
          >
            {palabra.texto}{" "}
          </span>
        );
      })}
    </p>
  );
}

/** La leyenda de colores. Se muestra antes de grabar, no durante. */
export function ComoLeerlo() {
  return (
    <div className="flex flex-col gap-2 rounded-[18px] border border-lavanda-100/15 bg-white/5 px-5 py-4">
      <p className="etiqueta text-lavanda-100/60">Cómo decirlo</p>
      <p className="text-[13px] leading-relaxed text-lavanda-100/75">
        Las palabras se van encendiendo al ritmo sugerido. Si vas más lento, no
        pasa nada: te espera.
      </p>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
        <span className="text-menta-400">suave</span>
        <span className="text-crema-50">normal</span>
        <span className="text-oro-500">con fuerza</span>
      </div>
    </div>
  );
}
