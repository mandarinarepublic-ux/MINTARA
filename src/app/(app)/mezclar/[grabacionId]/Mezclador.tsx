"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reproductor } from "@/lib/audio/reproductor";
import { construirPlan, type Frase } from "@/lib/audio/plan";
import { FONDOS, rutaDeFondo, nombreDeFondo } from "@/lib/audio/fondos";
import { guardarParaSinInternet, estaGuardado } from "@/lib/sinInternet";
import { puedeUsarSinInternet, type Plan } from "@/lib/planes";
import { guardarCortes } from "./acciones";

/** WAV vacío. Sirve para "despertar" los reproductores dentro del toque. */
const SILENCIO =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

/*
 * Sobre el volumen: NO se usa la propiedad `volume` del reproductor.
 *
 * En Safari de iPhone esa propiedad guarda el valor que se le pone —tanto
 * que leerla de vuelta devuelve lo que escribiste— pero no afecta al sonido:
 * Apple reserva el volumen a los botones físicos. Es decir, no hay forma
 * fiable de detectar si funciona, porque el navegador responde que sí y
 * luego lo ignora.
 *
 * Por eso el volumen va horneado dentro de cada pista al armarla. Cuesta un
 * segundo de espera al moverlo, pero suena igual en todos los teléfonos, que
 * es lo que importa.
 */

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
  planUsuario: Plan;
}) {
  const reproductor = useRef<Reproductor | null>(null);
  const pistaVoz = useRef<HTMLAudioElement | null>(null);
  const pistaFondo = useRef<HTMLAudioElement | null>(null);
  const urlVoz = useRef<string | null>(null);
  const urlFondo = useRef<string | null>(null);

  const [fondo, setFondo] = useState(fondosPermitidos[0] ?? "lluvia");
  const [vozVolumen, setVozVolumen] = useState(0.9);
  const [fondoVolumen, setFondoVolumen] = useState(0.35);
  const [pausa, setPausa] = useState(2);
  const [estudio, setEstudio] = useState(true);

  const [frases, setFrases] = useState<Frase[]>(cortesGuardados ?? []);
  const [sonando, setSonando] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [armado, setArmado] = useState(false);
  /** Con qué volúmenes se armó la pista que está sonando ahora. */
  const [vozArmada, setVozArmada] = useState(0);
  const [fondoArmado, setFondoArmado] = useState(0);

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
      // update() fuerza a comprobar si hay versión nueva: sin esto, un
      // service worker viejo puede quedarse servido durante días.
      void navigator.serviceWorker.register("/sw.js").then((r) => r.update());
    }
    void estaGuardado(grabacionId).then(setGuardado);

    return () => {
      // Los blobs pesan varios megas y el navegador no los suelta solo.
      if (urlVoz.current) URL.revokeObjectURL(urlVoz.current);
      if (urlFondo.current) URL.revokeObjectURL(urlFondo.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planActual = useCallback(
    () =>
      construirPlan(frases, {
        fondo,
        gananciaVoz: vozVolumen,
        gananciaFondo: fondoVolumen,
        pausaSeg: pausa,
        orden: "original",
      }),
    [frases, fondo, vozVolumen, fondoVolumen, pausa],
  );

  /** Arma ambas pistas con los volúmenes ya aplicados dentro. */
  async function armar(): Promise<void> {
    const plan = planActual();
    const [voz, ambiente] = await Promise.all([
      reproductor.current!.renderizarVoz(plan, estudio, vozVolumen),
      reproductor.current!.renderizarFondo(plan, fondoVolumen),
    ]);

    if (urlVoz.current) URL.revokeObjectURL(urlVoz.current);
    if (urlFondo.current) URL.revokeObjectURL(urlFondo.current);
    urlVoz.current = URL.createObjectURL(voz);
    urlFondo.current = URL.createObjectURL(ambiente);

    const v = pistaVoz.current!;
    const f = pistaFondo.current!;
    v.src = urlVoz.current;
    f.src = urlFondo.current;
    v.loop = true;
    f.loop = true;
    setVozArmada(vozVolumen);
    setFondoArmado(fondoVolumen);
    setArmado(true);
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
    navigator.mediaSession.setActionHandler("play", () => void escuchar());
    navigator.mediaSession.setActionHandler("pause", () => parar());
  }

  async function escuchar() {
    const v = pistaVoz.current;
    const f = pistaFondo.current;
    if (!v || !f) return;
    setError(null);

    // Dentro del toque: iOS solo deja sonar lo que arrancó por un gesto.
    if (!armado) {
      v.src = SILENCIO;
      f.src = SILENCIO;
      void v.play().catch(() => {});
      void f.play().catch(() => {});
    }

    try {
      setPreparando(true);
      if (!armado) await armar();
      // Arrancan juntas desde el mismo punto: duran exactamente lo mismo.
      const desde = v.currentTime;
      f.currentTime = desde;
      await Promise.all([v.play(), f.play()]);
      anunciarAlSistema();
      setSonando(true);
    } catch {
      setError("Toca otra vez para escuchar.");
    } finally {
      setPreparando(false);
    }
  }

  function parar() {
    pistaVoz.current?.pause();
    pistaFondo.current?.pause();
    setSonando(false);
  }

  /**
   * Al soltar cualquier control, se rehace el audio y vuelve a empezar.
   *
   * Empieza de cero a propósito: el cambio se juzga oyendo la pieza completa,
   * y retomar a mitad hacía que un ajuste de volumen se evaluara sobre una
   * frase suelta. Medio segundo de espera desde el último movimiento evita
   * rehacerlo en cada pixel del deslizador.
   */
  const primerAjuste = useRef(true);
  useEffect(() => {
    if (primerAjuste.current) {
      primerAjuste.current = false;
      return;
    }
    if (!reproductor.current?.listo || frases.length === 0 || !armado) return;

    const temporizador = setTimeout(async () => {
      const v = pistaVoz.current!;
      const f = pistaFondo.current!;
      const seguiaSonando = !v.paused;

      setPreparando(true);
      v.pause();
      f.pause();
      try {
        await armar();
        v.currentTime = 0;
        f.currentTime = 0;
        if (seguiaSonando) await Promise.all([v.play(), f.play()]);
      } catch {
        setError("No pudimos aplicar el cambio. Toca escuchar otra vez.");
      } finally {
        setPreparando(false);
      }
    }, 500);

    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vozVolumen, fondoVolumen, pausa, estudio]);

  async function cambiarFondo(id: string) {
    setFondo(id);
    setCargando(true);
    const seguia = sonando;
    const posicion = pistaVoz.current?.currentTime ?? 0;
    parar();
    try {
      await reproductor.current!.cambiarFondo(rutaDeFondo(id));
      await armar();
      pistaVoz.current!.currentTime = posicion;
      pistaFondo.current!.currentTime = posicion;
      setCargando(false);
      if (seguia) {
        await Promise.all([pistaVoz.current!.play(), pistaFondo.current!.play()]);
        setSonando(true);
      }
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
      {/* La voz manda: es la que lleva los controles del sistema. */}
      <audio
        ref={pistaVoz}
        onPlay={() => setSonando(true)}
        onPause={() => setSonando(false)}
        className="hidden"
      />
      <audio ref={pistaFondo} className="hidden" />

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
          <p className="text-[13px] text-menta-400">Aplicando tus cambios…</p>
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

      {/*
        Dos volúmenes independientes, y ambos se oyen al instante: son el
        volumen de cada pista, no un ajuste que obligue a rehacer el audio.
      */}
      <div className="flex flex-col gap-5 rounded-[18px] border border-lavanda-100/15 bg-white/5 px-5 py-5">
        <label className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between text-[13px] text-lavanda-100/70">
            <span>Tu voz</span>
            <span className="mono text-lavanda-100/50">
              {Math.round(vozVolumen * 100)}%
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={vozVolumen}
            onChange={(e) => setVozVolumen(Number(e.target.value))}
            className="accent-rosa-400"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between text-[13px] text-lavanda-100/70">
            <span>{nombreDeFondo(fondo)}</span>
            <span className="mono text-lavanda-100/50">
              {Math.round(fondoVolumen * 100)}%
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={fondoVolumen}
            onChange={(e) => setFondoVolumen(Number(e.target.value))}
            className="accent-menta-400"
          />
        </label>
      </div>

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
          className="accent-lila-400"
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
          onClick={() => setEstudio(!estudio)}
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

      {/*
        Marcador de diagnóstico. Dice qué versión del código está corriendo
        este teléfono y con qué volumen se armó la pista que suena ahora
        mismo. Si el número de abajo no coincide con lo que muestran los
        controles, el problema es de caché y no del audio.
      */}
      <p className="mono text-center text-[10px] text-lavanda-100/30">
        {process.env.NEXT_PUBLIC_VERSION} · pista armada con voz{" "}
        {Math.round(vozArmada * 100)}% · fondo {Math.round(fondoArmado * 100)}%
      </p>
    </div>
  );
}
