import Link from "next/link";
import Image from "next/image";
import { PRECIOS, LIMITES } from "@/lib/planes";
import type { Textos } from "@/lib/textos/catalogo";
import type { FamiliaConAmbientes } from "@/lib/ambientes";

/**
 * ⚠️ PROVISIONAL: la fotografía de fondo todavía no existe. Mientras llega,
 * el cielo se dibuja con degradados de la marca. Cuando esté la foto, se
 * reemplaza este bloque por un <Image fill> con el mismo overlay encima —
 * el resto de la maqueta no cambia.
 */
function CieloNocturno() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-violeta-900" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 8%, rgba(107,63,160,0.55) 0%, rgba(26,14,46,0) 60%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 78% 22%, rgba(216,139,200,0.28) 0%, rgba(26,14,46,0) 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 50% at 20% 85%, rgba(126,209,193,0.16) 0%, rgba(26,14,46,0) 65%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(26,14,46,0.82) 0%, rgba(26,14,46,0.45) 42%, rgba(26,14,46,0.92) 100%)",
        }}
      />
    </div>
  );
}

function Emblema({ tam = 34 }: { tam?: number }) {
  return (
    <Image
      src="/marca/mintara-badge.png"
      alt=""
      width={tam}
      height={tam}
      priority
      className="shrink-0"
    />
  );
}

/**
 * Vive aquí y no en `page.tsx` para que el panel pueda pintarlo tal cual en
 * la ventana de previsualización. Si el panel dibujara su propia versión del
 * hero, las dos se separarían con el primer cambio de diseño y la
 * previsualización empezaría a mentir.
 */
export function Hero({ t }: { t: Textos }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <CieloNocturno />

      <header className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-6 md:px-20">
        <Link href="/" className="flex items-center gap-3">
          <Emblema />
          <span className="display text-2xl text-crema-50">Míntara</span>
        </Link>
        <nav className="flex items-center gap-6 text-[13px] tracking-[0.06em]">
          <Link
            href="/privacidad"
            className="hidden text-lavanda-100/75 transition hover:text-crema-50 sm:block"
          >
            {t["portada.menu.privacidad"]}
          </Link>
          <Link
            href="/ingresar"
            className="rounded-full border border-lavanda-100/25 px-5 py-2 text-crema-50 transition hover:border-crema-50 hover:bg-crema-50/10"
          >
            {t["portada.menu.ingresar"]}
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[820px] flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <p className="eyebrow text-rosa-400">{t["portada.hero.eslogan"]}</p>

        <h1 className="text-[40px] leading-[1.08] text-pretty text-crema-50 sm:text-[56px] md:text-[80px] md:leading-[1.06]">
          {t["portada.hero.titulo"]}
        </h1>

        <p className="max-w-[560px] text-base leading-[1.7] text-lavanda-100/80 md:text-lg">
          {t["portada.hero.cuerpo"]}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/ingresar"
            className="rounded-full bg-oro-500 px-7 py-3.5 font-semibold text-violeta-600 transition hover:-translate-y-0.5 hover:bg-oro-400 active:scale-[0.97]"
          >
            {t["portada.hero.boton"]}
          </Link>
          <Link
            href="/privacidad"
            className="rounded-full border border-lavanda-100/25 px-7 py-3.5 text-crema-50 transition hover:border-crema-50 hover:bg-crema-50/10 active:scale-[0.97]"
          >
            {t["portada.hero.boton_secundario"]}
          </Link>
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-10 text-center text-[13px] text-lavanda-100/60">
        {t["portada.hero.pie"]}{" "}
        <Link href="/privacidad" className="text-rosa-400 hover:underline">
          {t["portada.hero.pie_enlace"]}
        </Link>
      </footer>
    </div>
  );
}

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

export function ComoFunciona({ t }: { t: Textos }) {
  const pasos = [
    {
      n: "01",
      titulo: t["portada.paso1.titulo"],
      cuerpo: t["portada.paso1.cuerpo"],
    },
    {
      n: "02",
      titulo: t["portada.paso2.titulo"],
      cuerpo: t["portada.paso2.cuerpo"],
    },
    {
      n: "03",
      titulo: t["portada.paso3.titulo"],
      cuerpo: t["portada.paso3.cuerpo"],
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1180px] px-6 py-20 md:px-20 md:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="eyebrow text-rosa-400">
          {t["portada.como_funciona.etiqueta"]}
        </p>
        <h2 className="display text-[32px] leading-[1.15] text-crema-50 md:text-[48px]">
          {t["portada.como_funciona.titulo"]}
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

/**
 * Los degradados van por posición, no por nombre de familia: así entran
 * familias nuevas sin tocar nada. Se repiten en cuanto pasan de cuatro.
 */
const TONOS = [
  "radial-gradient(90% 70% at 50% 20%, rgba(107,63,160,0.55) 0%, rgba(26,14,46,0) 70%)",
  "radial-gradient(90% 70% at 50% 20%, rgba(126,209,193,0.35) 0%, rgba(26,14,46,0) 70%)",
  "radial-gradient(90% 70% at 50% 20%, rgba(216,139,200,0.35) 0%, rgba(26,14,46,0) 70%)",
  "radial-gradient(90% 70% at 50% 20%, rgba(232,181,74,0.30) 0%, rgba(26,14,46,0) 70%)",
];

/**
 * Las familias salen de la base, no de una lista escrita aquí.
 *
 * Con la lista a mano, la portada prometía "Lluvia, Río y Mar" mientras el
 * panel ya tenía otros ambientes cargados: nadie se acordaba de venir a
 * cambiar este archivo. Ahora subir una familia desde el panel la anuncia
 * sola, y quitarla la retira.
 */
export function Ambientes({ familias }: { familias: FamiliaConAmbientes[] }) {
  if (familias.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1180px] px-6 pb-20 md:px-20 md:pb-24">
      <div className="grid gap-6 md:grid-cols-3">
        {familias.map((f, i) => (
          <div
            key={f.slug}
            className="relative h-[300px] overflow-hidden rounded-[22px]"
          >
            <Paisaje tono={TONOS[i % TONOS.length]} />
            <div className="absolute bottom-6 left-[26px]">
              <p className="display text-[28px] text-crema-50">{f.nombre}</p>
              <p className="text-[13px] text-lavanda-100/75">{f.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Privacidad({ t }: { t: Textos }) {
  return (
    <section className="border-y border-lavanda-100/10 bg-violeta-800">
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-6 py-20 md:grid-cols-2 md:gap-[70px] md:px-20 md:py-[90px]">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-menta-400">
            {t["portada.privacidad.etiqueta"]}
          </p>
          <h2 className="display text-[30px] leading-[1.15] text-crema-50 md:text-[44px]">
            {t["portada.privacidad.titulo"]}
          </h2>
          <p className="text-base leading-[1.8] text-lavanda-100/78">
            {t["portada.privacidad.cuerpo"]}
          </p>
          <Link href="/privacidad" className="text-[15px] text-menta-400 hover:underline">
            {t["portada.privacidad.enlace"]}
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[18px] border border-menta-400/30 bg-menta-400/8 px-6 py-[22px]">
            <h3 className="display text-[19px] text-crema-50">
              {t["portada.privacidad.duda1.titulo"]}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.7] text-lavanda-100/78">
              {t["portada.privacidad.duda1.cuerpo"]}
            </p>
          </div>

          <div className="rounded-[18px] border border-lavanda-100/15 bg-white/5 px-6 py-[22px]">
            <h3 className="display text-[19px] text-crema-50">
              {t["portada.privacidad.duda2.titulo"]}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.7] text-lavanda-100/78">
              {t["portada.privacidad.duda2.cuerpo"]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * La tabla de precios NO se edita desde el panel, a propósito: sus viñetas
 * describen límites reales (cuántos audios, cuántos minutos, qué ambientes).
 * Si se pudieran escribir a mano, alguien podría prometer cinco audios gratis
 * cuando el límite es uno, y la pantalla mentiría sin que nadie lo note.
 *
 * Por eso los números salen de `lib/planes` y los ambientes de la base.
 */
export function Precios({ familias }: { familias: FamiliaConAmbientes[] }) {
  const nombresFamilias = familias.map((f) => f.nombre);
  const gratis = familias
    .filter((f) => f.ambientes.some((a) => a.gratis))
    .map((f) => f.nombre);

  const planes = [
    {
      nombre: "Gratis",
      precio: "$0",
      destacado: false,
      incluye: [
        `${LIMITES.gratis.audios} audio guardado`,
        `Hasta ${LIMITES.gratis.segundos / 60} minuto de grabación`,
        gratis.length > 0
          ? `Ambiente ${gratis.join(" y ")}`
          : "Un ambiente para empezar",
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
        nombresFamilias.length > 0
          ? nombresFamilias.join(", ")
          : "Todos los ambientes",
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

export function Cierre({ t }: { t: Textos }) {
  return (
    <section className="relative flex h-[420px] items-center justify-center overflow-hidden">
      <Paisaje tono="radial-gradient(80% 80% at 50% 40%, rgba(107,63,160,0.5) 0%, rgba(26,14,46,0) 70%)" />
      <div className="relative z-10 flex max-w-[700px] flex-col items-center gap-8 px-6 text-center">
        <h2 className="display text-[30px] leading-[1.12] text-crema-50 md:text-[52px]">
          {t["portada.cierre.titulo"]}
        </h2>
        <Link
          href="/ingresar"
          className="rounded-full bg-oro-500 px-7 py-3.5 font-semibold text-violeta-600 transition hover:-translate-y-0.5 hover:bg-oro-400"
        >
          {t["portada.cierre.boton"]}
        </Link>
      </div>
    </section>
  );
}

export function Pie({ t }: { t: Textos }) {
  return (
    <footer className="border-t border-lavanda-100/10">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-6 py-8 text-[13px] text-lavanda-100/55 sm:flex-row sm:items-center sm:justify-between md:px-20">
        <span className="display text-[17px] text-crema-50">Míntara</span>
        <div className="flex gap-7">
          <Link href="/privacidad" className="hover:text-crema-50">
            {t["portada.pie.privacidad"]}
          </Link>
          <a
            href="https://wa.me/593983745757"
            className="hover:text-crema-50"
            target="_blank"
            rel="noreferrer"
          >
            {t["portada.pie.ayuda"]}
          </a>
        </div>
      </div>
    </footer>
  );
}
