import Link from "next/link";
import Image from "next/image";
import {
  ComoFunciona,
  Ambientes,
  Privacidad,
  Precios,
  Cierre,
  Pie,
} from "./(publico)/Secciones";

/**
 * Landing — Hero A (cielo nocturno a sangre completa).
 *
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

export default function Portada() {
  return (
    <>
      <Hero />
      <ComoFunciona />
      <Ambientes />
      <Privacidad />
      <Precios />
      <Cierre />
      <Pie />
    </>
  );
}

function Hero() {
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
            Cómo la cuidamos
          </Link>
          <Link
            href="/ingresar"
            className="rounded-full border border-lavanda-100/25 px-5 py-2 text-crema-50 transition hover:border-crema-50 hover:bg-crema-50/10"
          >
            Ingresar
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[820px] flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <p className="eyebrow text-rosa-400">
          Tu voz · Tus palabras · Tu intención
        </p>

        <h1 className="text-[40px] leading-[1.08] text-pretty text-crema-50 sm:text-[56px] md:text-[80px] md:leading-[1.06]">
          Escúchate decirte cosas buenas.
        </h1>

        <p className="max-w-[560px] text-base leading-[1.7] text-lavanda-100/80 md:text-lg">
          Grabas tu voz una vez. La dejamos sonando a estudio y la ponemos sobre
          lluvia, río o mar. Después la escuchas cuando la necesites.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/ingresar"
            className="rounded-full bg-oro-500 px-7 py-3.5 font-semibold text-violeta-600 transition hover:-translate-y-0.5 hover:bg-oro-400 active:scale-[0.97]"
          >
            Grabar mi voz
          </Link>
          <Link
            href="/privacidad"
            className="rounded-full border border-lavanda-100/25 px-7 py-3.5 text-crema-50 transition hover:border-crema-50 hover:bg-crema-50/10 active:scale-[0.97]"
          >
            Cómo funciona
          </Link>
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-10 text-center text-[13px] text-lavanda-100/60">
        Tu voz vive en tu teléfono y no se comparte con nadie.{" "}
        <Link href="/privacidad" className="text-rosa-400 hover:underline">
          Cómo la cuidamos →
        </Link>
      </footer>
    </div>
  );
}
