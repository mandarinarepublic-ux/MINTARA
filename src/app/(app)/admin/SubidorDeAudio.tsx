"use client";
import { useRef, useState } from "react";
import { supabaseNavegador } from "@/lib/supabase/cliente";

/**
 * Sube el MP3 directo del navegador al almacén.
 *
 * No pasa por una server action a propósito: los audios pesan varios megas y
 * ahí hay un tope de tamaño que los rechazaría. Al terminar deja la ruta en
 * un campo oculto, que es lo que guarda el formulario.
 */
export function SubidorDeAudio({
  familia,
  nombreCampo = "ruta",
  rutaActual,
}: {
  familia: string;
  nombreCampo?: string;
  rutaActual?: string;
}) {
  const [ruta, setRuta] = useState(rutaActual ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const entrada = useRef<HTMLInputElement | null>(null);

  async function subir(archivo: File) {
    setError(null);

    if (!archivo.type.startsWith("audio/")) {
      setError("Ese archivo no es un audio.");
      return;
    }
    if (archivo.size > 15 * 1024 * 1024) {
      setError("Pesa más de 15 MB. Recórtalo a 60-90 segundos.");
      return;
    }

    setSubiendo(true);
    const supabase = supabaseNavegador();

    // Nombre estable y sin sorpresas: sin tildes, espacios ni mayúsculas.
    const limpio = archivo.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9.]+/g, "-");
    const destino = `${familia}/${Date.now()}-${limpio}`;

    const { error: fallo } = await supabase.storage
      .from("fondos")
      .upload(destino, archivo, { contentType: archivo.type, upsert: true });

    setSubiendo(false);

    if (fallo) {
      setError(`No se pudo subir: ${fallo.message}`);
      return;
    }
    setRuta(destino);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={nombreCampo} value={ruta} />

      <button
        type="button"
        onClick={() => entrada.current?.click()}
        disabled={subiendo}
        className="rounded-full border border-lavanda-100/25 px-4 py-2.5 text-[13px] text-crema-50 transition hover:border-crema-50 disabled:opacity-50"
      >
        {subiendo ? "Subiendo…" : ruta ? "Cambiar audio" : "Subir audio"}
      </button>

      <input
        ref={entrada}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void subir(f);
        }}
      />

      {ruta && (
        <p className="mono truncate text-[11px] text-menta-400" title={ruta}>
          {ruta.split("/").pop()}
        </p>
      )}
      {error && <p className="text-[12px] text-rosa-400">{error}</p>}
    </div>
  );
}
