"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reproductor } from "@/lib/audio/reproductor";
import { construirPlan, type Frase } from "@/lib/audio/plan";
import { FONDOS, rutaDeFondo, nombreDeFondo } from "@/lib/audio/fondos";
import { guardarParaSinInternet, estaGuardado } from "@/lib/sinInternet";
import { puedeUsarSinInternet, type Plan } from "@/lib/planes";
import { guardarCortes } from "./acciones";

/** WAV vacío. Sirve para "despertar" el reproductor dentro del toque. */
const SILENCIO =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function Mezclador({
  grabacionId,
  titulo,
  vozUrl,
  cortesGuardados,
  fondosPermitidos,
  planUsuario,
}: {
  grabacionId: string;
  titulo: string;
  vozUrl: string;
  cortesGuardados: Frase[] | null;
  fondosPermitidos: string[];
  // Se llama planUsuario y no plan porque aquí `plan` ya es el plan de
  // mezcla que devuelve construirPlan.
  planUsuario: Plan;
}) {
  const reproductor = useRef<Reproductor | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const urlPista = useRef<string | null>(null);

  const [fondo, setFondo] = useState(fondosPermitidos[0] ?? "lluvia");
  const [ganancia, setGanancia] = useState(0.35);
  const [pausa, setPausa] = useState(2);
  const [estudio, setEstudio] = useState(true);

  const [frases, setFrases] = useState<Frase[]>(cortesGuardados ?? []);
  const [sonando, setSonando] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  /** La pista armada deja de servir cuando cambia cualquier ajuste. */
  const [vigente, setVigente] = useState(false);

  useEffect(() => {
    const r = new Reproductor();
    reproductor.current = r;

    r.cargar(vozUrl, rutaDeFondo(fondo))
      .then(() => {
        if ((cortesGuardados ?? []).length === 0) {
          const detectadas = r.analizarFrases();
          setFrases(detectadas);
          void guardarCortes(grabacionId, detectadas);
        }
        setCargando(false);
      })
      .catch(() => {
        setError("No pudimos cargar el audio. Recarga la página.");
        setCargando(false);
      });

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
    void estaGuardado(grabacionId).then(setGuardado);

    return () => {
      // Liberar el blob al salir: son varios megas por pista y el navegador
      // no los recoge solo mientras la URL siga viva.
      if (urlPista.current) URL.revokeObjectURL(urlPista.current);
    };
    // Solo al montar: el cambio de fondo se maneja aparte, sin recargar la voz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Cualquier ajuste invalida la pista ya armada. */
  function ajustar<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      setVigente(false);
    };
  }

  const planActual = useCallback(
    () =>
      construirPlan(frases, {
        fondo,
        gananciaFondo: ganancia,
        pausaSeg: pausa,
        orden: "original",
      }),
    [frases, fondo, ganancia, pausa],
  );

  async function armarPista(): Promise<string> {
    const blob = await reproductor.current!.renderizar(planActual(), estudio);
    if (urlPista.current) URL.revokeObjectURL(urlPista.current);
    const url = URL.createObjectURL(blob);
    urlPista.current = url;
    setVigente(true);
    return url;
  }

  function anunciarAlSistema() {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: titulo,
      artist: "Tu voz · Míntara",
      album: nombreDeFondo(fondo),
      artwork: [
        { src: "/marca/mintara-icon.png", sizes: "512x512", type: "image/png" },
      ],
    });
    navigator.mediaSession.setActionHandler("play", () => void audio.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audio.current?.pause());
  }

  async function escuchar() {
    const el = audio.current;
    if (!el) return;
    setError(null);

    // Dentro del toque: iOS solo deja sonar si el elemento arrancó por un
    // gesto. Sin esto, el audio queda mudo tras la espera del armado.
    if (!vigente) {
      el.src = SILENCIO;
      void el.play().catch(() => {});
    }

    try {
      setPreparando(true);
      const url = vigente && urlPista.current ? urlPista.current : await armarPista();
      el.src = url;
      el.loop = true;
      await el.play();
      anunciarAlSistema();
      setSonando(true);
    } catch {
      setError("Toca otra vez para escuchar.");
    } finally {
      setPreparando(false);
    }
  }

  function parar() {
    audio.current?.pause();
    setSonando(false);
  }

  async function cambiarFondo(id: string) {
    setFondo(id);
    setVigente(false);
    setCargando(true);
    const estaba = sonando;
    parar();
    try {
      await reproductor.current!.cambiarFondo(rutaDeFondo(id));
      setCargando(false);
      if (estaba) await escuchar();
    } catch {
      setError(`El ambiente ${nombreDeFondo(id)} todavía no está disponible.`);
      setCargando(false);
    }
  }

  async function guardarEnElCelular() {
    setGuardando(true);
    try {
      await guardarParaSinInternet(grabacionId, vozUrl, fondosPermitidos);
      setGuardado(true);
    } catch {
      setError("No pudimos guardarlo en tu celular. Puede faltar espacio.");
    }
    setGuardando(false);
  }

  const plan = frases.length ? planActual() : null;
  const ocupado = cargando || preparando;

  return (
    <div className="flex flex-col gap-7">
      <audio
        ref={audio}
        onPlay={() => setSonando(true)}
        onPause={() => setSonando(false)}
        className="hidden"
      />

      <div className="flex flex-col gap-5 rounded-[26px] border border-lavanda-100/20 bg-violeta-600/50 px-6 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (sonando ? parar() : escuchar())}
            disabled={ocupado || frases.length === 0}
            aria-label={sonando ? "Pausar" : "Escuchar"}
            className={`flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-rosa-400 text-violeta-600 transition active:scale-[0.97] disabled:opacity-40 ${
              sonando ? "" : "pulso"
            }`}
          >
            {sonando ? (
              <span className="block h-5 w-5 rounded-[4px] bg-violeta-600" />
            ) : (
              <span className="ml-1 text-2xl leading-none">▶</span>
            )}
          </button>

          <div className="flex h-[54px] flex-1 items-center gap-[3px]">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="flex-1 rounded-[3px] transition-opacity"
                style={{
                  height: `${28 + Math.round(Math.abs(Math.sin(i * 1.7)) * 70)}%`,
                  background: "linear-gradient(180deg,#7ED1C1,#A26DBE)",
                  opacity: sonando ? 0.95 : 0.5,
                }}
              />
            ))}
          </div>

          {plan && (
            <span className="mono shrink-0 text-[13px] tracking-[0.06em] text-lavanda-100/70">
              {Math.floor(plan.duracionTotal / 60)}:
              {String(Math.round(plan.duracionTotal % 60)).padStart(2, "0")}
            </span>
          )}
        </div>

        {preparando && (
          <p className="text-[13px] text-menta-400">Preparando tu audio…</p>
        )}
        {sonando && !preparando && (
          <p className="text-[13px] text-lavanda-100/60">
            Puedes bloquear la pantalla: sigue sonando.
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-lavanda-100/15 pt-[18px]">
          <span className="etiqueta text-lavanda-100/60">Ambiente</span>
          <div className="flex flex-wrap gap-2">
            {FONDOS.map((f) => {
              const permitido = fondosPermitidos.includes(f.id);
              const activo = f.id === fondo;
              return (
                <button
                  key={f.id}
                  onClick={() => permitido && cambiarFondo(f.id)}
                  disabled={!permitido || ocupado}
                  title={permitido ? f.para : "Disponible con Premium"}
                  className={`rounded-full border px-4 py-2 text-[13px] transition active:scale-[0.97] ${
                    activo
                      ? "border-transparent bg-menta-400 text-violeta-600"
                      : "border-lavanda-100/25 text-lavanda-100/80 hover:border-menta-400 hover:text-menta-400"
                  } ${permitido ? "" : "opacity-40"}`}
                >
                  {f.nombre}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] text-lavanda-100/70">
          Qué tan presente está el fondo · {Math.round(ganancia * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={0.8}
          step={0.05}
          value={ganancia}
          onChange={(e) => ajustar(setGanancia)(Number(e.target.value))}
          className="accent-rosa-400"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] text-lavanda-100/70">
          Silencio entre frases · {pausa.toFixed(1)} s
        </span>
        <input
          type="range"
          min={0}
          max={8}
          step={0.5}
          value={pausa}
          onChange={(e) => ajustar(setPausa)(Number(e.target.value))}
          className="accent-rosa-400"
        />
      </label>

      <div className="flex items-center justify-between rounded-[18px] border border-lavanda-100/15 bg-white/5 px-5 py-4">
        <div>
          <p className="text-[15px] text-crema-50">Voz de estudio</p>
          <p className="text-[13px] text-lavanda-100/60">
            Empareja el volumen y le da presencia
          </p>
        </div>
        <button
          onClick={() => ajustar(setEstudio)(!estudio)}
          aria-pressed={estudio}
          aria-label="Voz de estudio"
          className={`flex h-[26px] w-[44px] items-center rounded-full px-[3px] transition ${
            estudio ? "bg-menta-400" : "bg-lavanda-100/25"
          }`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-crema-50 transition ${
              estudio ? "translate-x-[18px]" : ""
            }`}
          />
        </button>
      </div>

      {!vigente && sonando === false && frases.length > 0 && !ocupado && (
        <p className="text-center text-[13px] text-lavanda-100/55">
          Toca escuchar para armar tu audio con estos ajustes.
        </p>
      )}

      {error && <p className="text-sm text-rosa-400">{error}</p>}

      {puedeUsarSinInternet(planUsuario) ? (
        <button
          onClick={guardarEnElCelular}
          disabled={guardado || guardando || cargando}
          className="rounded-full border border-lavanda-100/25 px-6 py-3.5 text-crema-50 transition hover:border-crema-50 active:scale-[0.97] disabled:opacity-50"
        >
          {guardado
            ? "Guardado en tu celular"
            : guardando
              ? "Guardando…"
              : "Guardar para escuchar sin internet"}
        </button>
      ) : (
        <p className="text-center text-[13px] text-lavanda-100/55">
          Con Premium puedes guardarlo para escucharlo sin internet.
        </p>
      )}

      <p className="text-center text-xs text-lavanda-100/50">
        Solo tú puedes oír este audio.
      </p>
    </div>
  );
}
