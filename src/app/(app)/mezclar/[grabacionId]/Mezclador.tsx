"use client";
import { useEffect, useRef, useState } from "react";
import { Reproductor } from "@/lib/audio/reproductor";
import { construirPlan, type Frase } from "@/lib/audio/plan";
import { FONDOS, rutaDeFondo, nombreDeFondo } from "@/lib/audio/fondos";
import { guardarParaSinInternet, estaGuardado } from "@/lib/sinInternet";
import { puedeUsarSinInternet, type Plan } from "@/lib/planes";
import { guardarCortes } from "./acciones";

export function Mezclador({
  grabacionId,
  vozUrl,
  cortesGuardados,
  fondosPermitidos,
  planUsuario,
}: {
  grabacionId: string;
  vozUrl: string;
  cortesGuardados: Frase[] | null;
  fondosPermitidos: string[];
  // Se llama planUsuario y no plan porque aquí `plan` ya es el plan de
  // mezcla que devuelve construirPlan.
  planUsuario: Plan;
}) {
  const reproductor = useRef<Reproductor | null>(null);
  const [fondo, setFondo] = useState(fondosPermitidos[0] ?? "lluvia");
  const [ganancia, setGanancia] = useState(0.35);
  const [pausa, setPausa] = useState(2);
  const [frases, setFrases] = useState<Frase[]>(cortesGuardados ?? []);
  const [sonando, setSonando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [estudio, setEstudio] = useState(true);

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

    return () => r.detener();
    // Solo al montar: el cambio de fondo se maneja aparte, sin recargar la voz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cambiarFondo(id: string) {
    setFondo(id);
    setCargando(true);
    try {
      await reproductor.current!.cambiarFondo(rutaDeFondo(id));
      setCargando(false);
      if (sonando) sonar(id);
    } catch {
      setError(`El ambiente ${nombreDeFondo(id)} todavía no está disponible.`);
      setCargando(false);
    }
  }

  function planCon(fondoId: string) {
    return construirPlan(frases, {
      fondo: fondoId,
      gananciaFondo: ganancia,
      pausaSeg: pausa,
      orden: "original",
    });
  }

  function sonar(fondoId = fondo, conEstudio = estudio) {
    reproductor.current!.reproducir(planCon(fondoId), true, conEstudio);
    setSonando(true);
  }

  function parar() {
    reproductor.current!.detener();
    setSonando(false);
  }

  /** Cambia el tratamiento en caliente, para poder comparar sin parar. */
  function alternarEstudio() {
    const nuevo = !estudio;
    setEstudio(nuevo);
    if (sonando) sonar(fondo, nuevo);
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

  const plan = frases.length ? planCon(fondo) : null;

  return (
    <div className="flex flex-col gap-7">
      {/* Reproductor */}
      <div className="flex flex-col gap-5 rounded-[26px] border border-lavanda-100/20 bg-violeta-600/50 px-6 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (sonando ? parar() : sonar())}
            disabled={cargando || frases.length === 0}
            aria-label={sonando ? "Parar" : "Escuchar"}
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
                className="flex-1 rounded-[3px] opacity-80"
                style={{
                  height: `${28 + Math.round(Math.abs(Math.sin(i * 1.7)) * 70)}%`,
                  background: "linear-gradient(180deg,#7ED1C1,#A26DBE)",
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
                  disabled={!permitido}
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

      {/* Ajustes */}
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
          onChange={(e) => setGanancia(Number(e.target.value))}
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
          onChange={(e) => setPausa(Number(e.target.value))}
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
          onClick={alternarEstudio}
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
