import Link from "next/link";
import { PRECIOS, LIMITES } from "@/lib/planes";

/**
 * Secciones del landing (handoff 2.1 a 2.6).
 *
 * Las fotografías todavía no existen: donde el diseño pide imagen a sangre
 * va un degradado de marca, igual que en el hero. Cambiarlas después es
 * sustituir este componente por un <Image fill>, sin tocar nada más.
 */
function Paisaje({ tono }: { tono: string }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-violeta-900" />
      <div className="absolute inset-0" style={{ background: tono }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(26,14,46,0) 35%, rgba(26,14,46,0.9) 100%)",
        }}
      />
    </div>
  );
}

export function ComoFunciona() {
  const pasos = [
    {
      n: "01",
      titulo: "Lees tus afirmaciones",
      cuerpo:
        "Escribes las tuyas o eliges de nuestras listas. Después las lees en voz alta una sola vez.",
    },
    {
      n: "02",
      titulo: "Eliges tu ambiente",
      cuerpo:
        "Dejamos tu voz sonando a estudio y la mezclamos con lluvia, río o mar, al volumen que tú quieras.",
    },
    {
      n: "03",
      titulo: "Lo escuchas cuando quieras",
      cuerpo:
        "Queda en tu biblioteca. Al despertar, antes de dormir o cuando necesites acordarte de quién eres.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1180px] px-6 py-20 md:px-20 md:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="eyebrow text-rosa-400">Cómo funciona</p>
        <h2 className="display text-[32px] leading-[1.15] text-crema-50 md:text-[48px]">
          Tres pasos y ya es tuyo.
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {pasos.map((p) => (
          <div
            key={p.n}
            className="flex flex-col gap-4 rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[30px] py-[34px] transition hover:-translate-y-1 hover:border-lila-400"
          >
            <p className="display text-[40px] leading-none text-oro-500">{p.n}</p>
            <h3 className="display text-2xl text-crema-50">{p.titulo}</h3>
            <p className="text-[15px] leading-[1.7] text-lavanda-100/72">
              {p.cuerpo}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Ambientes() {
  const ambientes = [
    {
      nombre: "Lluvia",
      para: "Para dormir y soltar el día",
      tono:
        "radial-gradient(90% 70% at 50% 20%, rgba(107,63,160,0.55) 0%, rgba(26,14,46,0) 70%)",
    },
    {
      nombre: "Río",
      para: "Para concentrarte y avanzar",
      tono:
        "radial-gradient(90% 70% at 50% 20%, rgba(126,209,193,0.35) 0%, rgba(26,14,46,0) 70%)",
    },
    {
      nombre: "Mar",
      para: "Para empezar la mañana",
      tono:
        "radial-gradient(90% 70% at 50% 20%, rgba(216,139,200,0.35) 0%, rgba(26,14,46,0) 70%)",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1180px] px-6 pb-20 md:px-20 md:pb-24">
      <div className="grid gap-6 md:grid-cols-3">
        {ambientes.map((a) => (
          <div
            key={a.nombre}
            className="relative h-[300px] overflow-hidden rounded-[22px]"
          >
            <Paisaje tono={a.tono} />
            <div className="absolute bottom-6 left-[26px]">
              <p className="display text-[28px] text-crema-50">{a.nombre}</p>
              <p className="text-[13px] text-lavanda-100/75">{a.para}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Privacidad() {
  return (
    <section className="border-y border-lavanda-100/10 bg-violeta-800">
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-6 py-20 md:grid-cols-2 md:gap-[70px] md:px-20 md:py-[90px]">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-menta-400">Tu voz es tuya</p>
          <h2 className="display text-[30px] leading-[1.15] text-crema-50 md:text-[44px]">
            Nadie va a oír tu audio. Nunca.
          </h2>
          <p className="text-base leading-[1.8] text-lavanda-100/78">
            Tu grabación se guarda para ti y no sale de la app. No se comparte,
            no se publica, no se usa para entrenar nada y no se vende a nadie.
            Si borras un audio, se borra.
          </p>
          <Link href="/privacidad" className="text-[15px] text-menta-400 hover:underline">
            Leer la política de privacidad →
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[18px] border border-menta-400/30 bg-menta-400/8 px-6 py-[22px]">
            <h3 className="display text-[19px] text-crema-50">
              «Me da vergüenza oír mi voz»
            </h3>
            <p className="mt-2 text-[15px] leading-[1.7] text-lavanda-100/78">
              Es lo más normal los primeros segundos. A los tres días deja de
              sonar raro y empieza a sonar como alguien en quien confías. Y
              nadie más la va a escuchar.
            </p>
          </div>

          <div className="rounded-[18px] border border-lavanda-100/15 bg-white/5 px-6 py-[22px]">
            <h3 className="display text-[19px] text-crema-50">
              «¿Y si no me gusta cómo suena?»
            </h3>
            <p className="mt-2 text-[15px] leading-[1.7] text-lavanda-100/78">
              Puedes volver a grabar cuantas veces quieras. Lo que subes se
              queda solo hasta que decidas borrarlo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Precios() {
  const planes = [
    {
      nombre: "Gratis",
      precio: "$0",
      destacado: false,
      incluye: [
        `${LIMITES.gratis.audios} audio guardado`,
        `Hasta ${LIMITES.gratis.segundos / 60} minuto de grabación`,
        "Ambiente lluvia",
        "Tus afirmaciones escritas por ti",
      ],
      cta: "Grabar mi voz",
      href: "/ingresar",
    },
    {
      nombre: "Premium mensual",
      precio: PRECIOS.mensual.etiqueta,
      destacado: true,
      incluye: [
        "Audios ilimitados",
        `Hasta ${LIMITES.premium.segundos / 60} minutos por grabación`,
        "Lluvia, río y mar",
        "Descargas para oír sin internet",
      ],
      cta: "Empezar Premium",
      href: "/ingresar",
    },
    {
      nombre: "Premium anual",
      precio: PRECIOS.anual.etiqueta,
      destacado: false,
      incluye: [
        "Todo lo de Premium mensual",
        "Casi cinco meses de regalo",
        "Ambientes nuevos primero",
      ],
      cta: "Pagar un año",
      href: "/ingresar",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1180px] px-6 py-20 md:px-20 md:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="eyebrow text-rosa-400">Precios</p>
        <h2 className="display text-[32px] leading-[1.15] text-crema-50 md:text-[48px]">
          Empieza gratis.
        </h2>
        <p className="max-w-[520px] text-base text-lavanda-100/72">
          Sin tarjeta. Pasas a Premium solo si quieres más audios y más
          ambientes.
        </p>
      </div>

      <div className="mt-12 grid gap-[22px] md:grid-cols-3">
        {planes.map((p) => (
          <div
            key={p.nombre}
            className={`relative flex flex-col gap-5 rounded-[24px] px-[30px] py-[34px] ${
              p.destacado
                ? "border border-oro-500 bg-gradient-to-b from-violeta-500/45 to-lila-400/20"
                : "border border-lavanda-100/15 bg-white/5"
            }`}
          >
            {p.destacado && (
              <span className="absolute -top-[13px] left-[30px] rounded-full bg-oro-500 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-violeta-600">
                Más elegido
              </span>
            )}

            <p className="text-[15px] text-lavanda-100/80">{p.nombre}</p>
            <p className="display text-[44px] leading-none text-crema-50">
              {p.precio}
            </p>

            <ul className="flex flex-col gap-2.5">
              {p.incluye.map((i) => (
                <li key={i} className="text-sm leading-[1.6] text-lavanda-100/75">
                  {i}
                </li>
              ))}
            </ul>

            <Link
              href={p.href}
              className={`mt-auto rounded-full px-5 py-3 text-center font-semibold transition active:scale-[0.97] ${
                p.destacado
                  ? "bg-oro-500 text-violeta-600 hover:bg-oro-400"
                  : "border border-lavanda-100/25 text-crema-50 hover:border-crema-50"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Cierre() {
  return (
    <section className="relative flex h-[420px] items-center justify-center overflow-hidden">
      <Paisaje tono="radial-gradient(80% 80% at 50% 40%, rgba(107,63,160,0.5) 0%, rgba(26,14,46,0) 70%)" />
      <div className="relative z-10 flex max-w-[700px] flex-col items-center gap-8 px-6 text-center">
        <h2 className="display text-[30px] leading-[1.12] text-crema-50 md:text-[52px]">
          La voz que más escuchas es la tuya. Que diga algo bueno.
        </h2>
        <Link
          href="/ingresar"
          className="rounded-full bg-oro-500 px-7 py-3.5 font-semibold text-violeta-600 transition hover:-translate-y-0.5 hover:bg-oro-400"
        >
          Grabar mi voz
        </Link>
      </div>
    </section>
  );
}

export function Pie() {
  return (
    <footer className="border-t border-lavanda-100/10">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-6 py-8 text-[13px] text-lavanda-100/55 sm:flex-row sm:items-center sm:justify-between md:px-20">
        <span className="display text-[17px] text-crema-50">Míntara</span>
        <div className="flex gap-7">
          <Link href="/privacidad" className="hover:text-crema-50">
            Privacidad
          </Link>
          <a
            href="https://wa.me/593983745757"
            className="hover:text-crema-50"
            target="_blank"
            rel="noreferrer"
          >
            Ayuda por WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
