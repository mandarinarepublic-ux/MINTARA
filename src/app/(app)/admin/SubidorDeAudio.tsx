"use client";
import { useState } from "react";

/**
 * Selector del archivo de audio.
 *
 * El archivo viaja dentro del formulario y lo sube el servidor: subirlo
 * desde aquí directo al almacén chocaba con las reglas de permisos de la
 * base, que no saben resolver el rol del usuario en ese contexto.
 */
export function SubidorDeAudio({
  familia,
  rutaActual,
}: {
  familia: string;
  rutaActual?: string;
}) {
  const [elegido, setElegido] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="familia" value={familia} />

      <label className="flex cursor-pointer flex-col gap-2">
        <span className="etiqueta text-lavanda-100/60">
          {rutaActual ? "Cambiar el audio" : "Audio"}
        </span>
        <input
          type="file"
          name="audio"
          accept="audio/*"
          onChange={(e) => setElegido(e.target.files?.[0]?.name ?? null)}
          className="text-[13px] text-lavanda-100/70 file:mr-3 file:rounded-full file:border file:border-lavanda-100/25 file:bg-transparent file:px-4 file:py-2 file:text-[13px] file:text-crema-50"
        />
      </label>

      {elegido && <p className="mono text-[11px] text-menta-400">{elegido}</p>}

      {!elegido && rutaActual && (
        <p className="mono truncate text-[11px] text-lavanda-100/50" title={rutaActual}>
          Ahora: {rutaActual.split("/").pop()}
        </p>
      )}
    </div>
  );
}
