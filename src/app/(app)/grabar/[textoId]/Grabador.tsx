"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { formatoSoportado, extensionDe } from "@/lib/audio/grabacion";

type Estado = "listo" | "grabando" | "revisando" | "subiendo";

export function Grabador({
  textoId,
  perfilId,
  frases,
}: {
  textoId: string;
  perfilId: string;
  frases: string[];
}) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("listo");
  const [error, setError] = useState<string | null>(null);
  const [prueba, setPrueba] = useState<string | null>(null);
  const grabadora = useRef<MediaRecorder | null>(null);
  const trozos = useRef<Blob[]>([]);
  const mime = useRef<string>("");

  async function empezar() {
    setError(null);
    const formato = formatoSoportado();
    if (!formato) {
      setError("Tu navegador no permite grabar. Prueba con Chrome o Safari actualizado.");
      return;
    }
    try {
      const pista = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mime.current = formato;
      trozos.current = [];
      const rec = new MediaRecorder(pista, { mimeType: formato });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) trozos.current.push(e.data);
      };
      rec.onstop = () => {
        pista.getTracks().forEach((t) => t.stop());
        const blob = new Blob(trozos.current, { type: mime.current });
        setPrueba(URL.createObjectURL(blob));
        setEstado("revisando");
      };
      grabadora.current = rec;
      rec.start();
      setEstado("grabando");
    } catch {
      setError("No pudimos usar el micrófono. Revisa los permisos del navegador.");
    }
  }

  function parar() {
    grabadora.current?.stop();
  }

  async function subir() {
    setEstado("subiendo");
    const supabase = supabaseNavegador();
    const blob = new Blob(trozos.current, { type: mime.current });
    const ruta = `${perfilId}/${textoId}/cruda.${extensionDe(mime.current)}`;

    const { error: fallo } = await supabase.storage
      .from("voces")
      .upload(ruta, blob, { contentType: mime.current, upsert: true });

    if (fallo) {
      setError("No pudimos guardar la grabación. Revisa tu conexión.");
      setEstado("revisando");
      return;
    }

    const { data, error: fallo2 } = await supabase
      .from("grabaciones")
      .insert({ perfil_id: perfilId, texto_id: textoId, estado: "cruda", ruta_cruda: ruta })
      .select("id")
      .single();

    if (fallo2 || !data) {
      setError("Se guardó el audio pero no la ficha. Inténtalo de nuevo.");
      setEstado("revisando");
      return;
    }

    router.push(`/grabar/esperando?grabacion=${data.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col gap-4 text-2xl leading-relaxed">
        {frases.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ol>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {estado === "listo" && (
        <button onClick={empezar} className="rounded-xl bg-red-600 px-4 py-4 text-white">
          Grabar
        </button>
      )}
      {estado === "grabando" && (
        <button onClick={parar} className="rounded-xl bg-neutral-900 px-4 py-4 text-white">
          Ya terminé
        </button>
      )}
      {estado === "revisando" && prueba && (
        <div className="flex flex-col gap-3">
          <audio controls src={prueba} className="w-full" />
          <button
            onClick={subir}
            className="rounded-xl bg-neutral-900 px-4 py-3 text-white"
          >
            Me gusta, seguir
          </button>
          <button
            onClick={() => setEstado("listo")}
            className="text-sm text-neutral-500 underline"
          >
            Volver a grabar
          </button>
        </div>
      )}
      {estado === "subiendo" && <p className="text-neutral-500">Guardando tu voz…</p>}
    </div>
  );
}
