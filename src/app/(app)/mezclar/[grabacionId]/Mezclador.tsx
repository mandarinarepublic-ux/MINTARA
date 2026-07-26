"use client";
import { useEffect, useRef, useState } from "react";
import { Reproductor } from "@/lib/audio/reproductor";
import { construirPlan, type Frase } from "@/lib/audio/plan";
import { FONDOS, rutaDeFondo } from "@/lib/audio/fondos";
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

  async function cambiarFondo(id: string) {
    setFondo(id);
    setCargando(true);
    try {
      await reproductor.current!.cambiarFondo(rutaDeFondo(id));
      setCargando(false);
      if (sonando) sonar(id);
    } catch {
      setError("Ese fondo no se pudo cargar.");
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

  function sonar(fondoId = fondo) {
    reproductor.current!.reproducir(planCon(fondoId), true);
    setSonando(true);
  }

  function parar() {
    reproductor.current!.detener();
    setSonando(false);
  }

  const plan = frases.length ? planCon(fondo) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-neutral-500">Fondo</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FONDOS.map((f) => {
            const permitido = fondosPermitidos.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => permitido && cambiarFondo(f.id)}
                disabled={!permitido}
                title={permitido ? undefined : "Disponible con más grabaciones"}
                className={`rounded-full border px-4 py-2 text-sm ${
                  f.id === fondo
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300"
                } ${permitido ? "" : "opacity-40"}`}
              >
                {f.nombre}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-neutral-500">
          Qué tan presente está el fondo: {Math.round(ganancia * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={0.8}
          step={0.05}
          value={ganancia}
          onChange={(e) => setGanancia(Number(e.target.value))}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-neutral-500">
          Silencio entre frases: {pausa.toFixed(1)} s
        </span>
        <input
          type="range"
          min={0}
          max={8}
          step={0.5}
          value={pausa}
          onChange={(e) => setPausa(Number(e.target.value))}
        />
      </label>

      {plan && (
        <p className="text-sm text-neutral-500">
          {frases.length} frases · {Math.round(plan.duracionTotal)} segundos
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={() => (sonando ? parar() : sonar())}
        disabled={cargando || frases.length === 0}
        className="rounded-xl bg-neutral-900 px-4 py-4 text-white disabled:opacity-50"
      >
        {cargando ? "Preparando…" : sonando ? "Parar" : "Escuchar"}
      </button>

      {puedeUsarSinInternet(planUsuario) && (
        <button
          onClick={guardarEnElCelular}
          disabled={guardado || guardando || cargando}
          className="rounded-xl border border-neutral-300 px-4 py-3 disabled:opacity-50"
        >
          {guardado
            ? "Guardado en tu celular"
            : guardando
              ? "Guardando…"
              : "Guardar para escuchar sin internet"}
        </button>
      )}
    </div>
  );
}
