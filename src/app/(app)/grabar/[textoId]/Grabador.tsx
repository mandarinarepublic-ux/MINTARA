"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { formatoSoportado, extensionDe } from "@/lib/audio/grabacion";

type Estado = "listo" | "grabando" | "revisando" | "subiendo";

/** mm:ss a partir de milisegundos. */
function reloj(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function Grabador({
  textoId,
  perfilId,
  frases,
  segundosMaximos,
}: {
  textoId: string;
  perfilId: string;
  frases: string[];
  segundosMaximos: number;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("listo");
  const [error, setError] = useState<string | null>(null);
  const [prueba, setPrueba] = useState<string | null>(null);
  const [transcurrido, setTranscurrido] = useState(0);
  const [niveles, setNiveles] = useState<number[]>(Array(48).fill(0.06));

  const grabadora = useRef<MediaRecorder | null>(null);
  const trozos = useRef<Blob[]>([]);
  const mime = useRef<string>("");
  const analizador = useRef<AnalyserNode | null>(null);
  const contexto = useRef<AudioContext | null>(null);
  const animacion = useRef<number | null>(null);
  const inicio = useRef<number>(0);

  // Se limpia todo al salir: un micrófono que sigue abierto deja el punto
  // rojo encendido en el teléfono y asusta, con razón.
  useEffect(() => {
    return () => {
      if (animacion.current) cancelAnimationFrame(animacion.current);
      grabadora.current?.stream.getTracks().forEach((t) => t.stop());
      void contexto.current?.close();
    };
  }, []);

  function dibujar() {
    const nodo = analizador.current;
    if (!nodo) return;
    const datos = new Uint8Array(nodo.frequencyBinCount);
    nodo.getByteTimeDomainData(datos);

    let pico = 0;
    for (let i = 0; i < datos.length; i++) {
      pico = Math.max(pico, Math.abs(datos[i] - 128) / 128);
    }

    setNiveles((antes) => [...antes.slice(1), Math.max(0.06, Math.min(1, pico * 1.8))]);
    setTranscurrido(Date.now() - inicio.current);

    if (Date.now() - inicio.current >= segundosMaximos * 1000) {
      parar();
      return;
    }
    animacion.current = requestAnimationFrame(dibujar);
  }

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

      contexto.current = new AudioContext();
      const fuente = contexto.current.createMediaStreamSource(pista);
      const nodo = contexto.current.createAnalyser();
      nodo.fftSize = 1024;
      fuente.connect(nodo);
      analizador.current = nodo;

      mime.current = formato;
      trozos.current = [];
      const rec = new MediaRecorder(pista, { mimeType: formato });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) trozos.current.push(e.data);
      };
      rec.onstop = () => {
        pista.getTracks().forEach((t) => t.stop());
        if (animacion.current) cancelAnimationFrame(animacion.current);
        void contexto.current?.close();
        contexto.current = null;
        const blob = new Blob(trozos.current, { type: mime.current });
        setPrueba(URL.createObjectURL(blob));
        setEstado("revisando");
      };
      grabadora.current = rec;
      rec.start();
      inicio.current = Date.now();
      setTranscurrido(0);
      setEstado("grabando");
      animacion.current = requestAnimationFrame(dibujar);
    } catch {
      setError(
        "No pudimos usar el micrófono. Revisa que le hayas dado permiso a Míntara en tu navegador.",
      );
    }
  }

  function parar() {
    grabadora.current?.stop();
  }

  async function subir() {
    setEstado("subiendo");
    const supabase = supabaseNavegador();
    const blob = new Blob(trozos.current, { type: mime.current });
    // La toma ES la voz definitiva: no pasa por ningún servicio externo.
    const ruta = `${perfilId}/${textoId}/voz.${extensionDe(mime.current)}`;

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
      .insert({
        perfil_id: perfilId,
        texto_id: textoId,
        estado: "lista",
        ruta_master: ruta,
      })
      .select("id")
      .single();

    if (fallo2 || !data) {
      setError("Se guardó el audio pero no la ficha. Inténtalo de nuevo.");
      setEstado("revisando");
      return;
    }

    router.push(`/mezclar/${data.id}`);
  }

  const quedan = segundosMaximos * 1000 - transcurrido;

  return (
    <div className="flex min-h-[70dvh] flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[22px] py-[26px]">
        {frases.map((f, i) => (
          <p
            key={i}
            className={`display leading-[1.5] ${
              i === 0
                ? "text-[23px] text-crema-50"
                : "border-t border-lavanda-100/10 pt-4 text-[15px] text-lavanda-100/55"
            }`}
          >
            {f}
          </p>
        ))}
      </div>

      {error && <p className="text-sm text-rosa-400">{error}</p>}

      <div className="mt-auto flex flex-col items-center gap-5">
        {estado === "grabando" && (
          <>
            <div className="flex h-[70px] w-full items-center gap-[3px]">
              {niveles.map((n, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-[3px]"
                  style={{
                    height: `${Math.round(n * 100)}%`,
                    background: "linear-gradient(180deg,#7ED1C1,#A26DBE)",
                  }}
                />
              ))}
            </div>
            <p className="mono text-[15px] tracking-[0.1em] text-menta-400">
              {reloj(transcurrido)}
              <span className="ml-2 text-lavanda-100/45">
                / quedan {reloj(Math.max(0, quedan))}
              </span>
            </p>
          </>
        )}

        {estado === "listo" && (
          <button
            onClick={empezar}
            aria-label="Grabar"
            className="pulso h-[88px] w-[88px] rounded-full bg-rosa-400 transition active:scale-[0.97]"
          />
        )}

        {estado === "grabando" && (
          <button
            onClick={parar}
            aria-label="Terminar"
            className="pulso flex h-[88px] w-[88px] items-center justify-center rounded-full bg-rosa-400 transition active:scale-[0.97]"
          >
            <span className="block h-[26px] w-[26px] rounded-[6px] bg-violeta-600" />
          </button>
        )}

        {estado === "listo" && (
          <p className="text-[13px] text-lavanda-100/60">Toca para empezar</p>
        )}
        {estado === "grabando" && (
          <p className="text-[13px] text-lavanda-100/60">Toca para terminar</p>
        )}

        {estado === "revisando" && prueba && (
          <div className="flex w-full flex-col gap-3">
            <audio controls src={prueba} className="w-full" />
            <button
              onClick={subir}
              className="rounded-full bg-oro-500 px-6 py-3.5 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]"
            >
              Me gusta, seguir
            </button>
            <button
              onClick={() => setEstado("listo")}
              className="text-[13px] text-rosa-400 hover:underline"
            >
              Volver a grabar
            </button>
          </div>
        )}

        {estado === "subiendo" && (
          <p className="text-lavanda-100/70">Guardando tu voz…</p>
        )}
      </div>
    </div>
  );
}
