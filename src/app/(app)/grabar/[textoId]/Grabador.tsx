"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { formatoSoportado, extensionDe } from "@/lib/audio/grabacion";
import { Karaoke, ComoLeerlo } from "./Karaoke";
import { construirGuion, duracionDelGuion } from "@/lib/audio/interpretacion";

/**
 * Cuánto silencio hay que dejar para que la grabación se corte sola.
 *
 * Va por silencio y no por reloj a propósito: si parara al acabarse el guion,
 * quien lee más despacio —que es lo que queremos— se quedaría cortado a media
 * frase.
 */
const SILENCIO_PARA_PARAR_MS = 2000;

/** Por debajo de esto se considera que ya no habla nadie. */
const UMBRAL_DE_SILENCIO = 0.06;

type Estado = "listo" | "grabando" | "revisando" | "subiendo";

/**
 * Lo que queda de texto, como una barra que se agota.
 *
 * Un reloj obliga a leer un número y hacer una cuenta mientras hablas; una
 * barra se entiende de reojo, que es todo el tiempo de atención que le sobra
 * a alguien leyendo en voz alta. Se vacía por la izquierda: lo que queda se
 * va apretando contra el final.
 */
function BarraDeTiempo({ restante }: { restante: number }) {
  const terminado = restante <= 0;
  const acabando = restante < 0.15;

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex h-[5px] w-full justify-end overflow-hidden rounded-full bg-lavanda-100/12">
        <span
          className="h-full rounded-full transition-[width] duration-200 ease-linear"
          style={{
            width: `${restante * 100}%`,
            background: acabando
              ? "var(--color-rosa-400)"
              : "linear-gradient(90deg,#7ED1C1,#A26DBE)",
          }}
        />
      </div>

      <p
        className={`text-[13px] ${
          terminado ? "text-rosa-400" : "text-lavanda-100/55"
        }`}
      >
        {terminado
          ? "Cuando termines, se detiene sola"
          : acabando
            ? "Última frase"
            : "Tómate tu tiempo"}
      </p>
    </div>
  );
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
  /** Desde cuándo no se oye nada. null si está hablando. */
  const callado = useRef<number | null>(null);
  /** Si ya habló alguna vez: sin esto pararía antes de empezar. */
  const yaHablo = useRef(false);

  const guion = useMemo(() => construirGuion(frases), [frases]);
  const duracionGuionMs = duracionDelGuion(guion) * 1000;

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

    const ahora = Date.now();
    const llevaGrabando = ahora - inicio.current;
    setTranscurrido(llevaGrabando);

    // Se para sola cuando se acaba de hablar: hay que haber dicho algo, haber
    // llegado al final del guion, y llevar callado el margen acordado.
    if (pico >= UMBRAL_DE_SILENCIO) {
      yaHablo.current = true;
      callado.current = null;
    } else if (callado.current === null) {
      callado.current = ahora;
    }

    const terminoElGuion = llevaGrabando >= duracionGuionMs;
    const lleveCallado = callado.current === null ? 0 : ahora - callado.current;

    if (
      (yaHablo.current && terminoElGuion && lleveCallado >= SILENCIO_PARA_PARAR_MS) ||
      llevaGrabando >= segundosMaximos * 1000
    ) {
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
      callado.current = null;
      yaHablo.current = false;
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


  return (
    /*
     * Tres zonas: instrucciones arriba, texto en medio con su propio
     * desplazamiento, y los controles anclados abajo. Antes el texto empujaba
     * el botón de grabar fuera de la pantalla y no se veía ni el principio
     * del texto ni el botón.
     */
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Las instrucciones van ANTES del texto: se leen para prepararse, y
          después de leer el texto ya no sirven de nada. */}
      {estado === "listo" && <ComoLeerlo />}

      <div className="min-h-0 flex-1 rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[22px] py-5">
        <Karaoke
          frases={frases}
          grabando={estado === "grabando"}
          transcurridoMs={transcurrido}
        />
      </div>

      {error && <p className="text-sm text-rosa-400">{error}</p>}

      <div className="sticky bottom-0 -mx-[22px] flex flex-col items-center gap-4 bg-violeta-700/95 px-[22px] pb-6 pt-3 backdrop-blur">
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
            <BarraDeTiempo
              restante={Math.max(0, 1 - transcurrido / duracionGuionMs)}
            />
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
