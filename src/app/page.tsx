import Link from "next/link";

export default function Portada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-8 px-6">
      <div>
        <h1 className="text-4xl font-semibold leading-tight">
          Escúchate decirte cosas buenas.
        </h1>
        <p className="mt-4 text-lg text-neutral-500">
          Grabas tu voz una vez. Nosotros la dejamos sonando a estudio y la
          ponemos sobre lluvia, río o mar. Después la escuchas cuando la
          necesites.
        </p>
      </div>

      <Link
        href="/ingresar"
        className="rounded-xl bg-neutral-900 px-4 py-4 text-center text-white"
      >
        Grabar mi voz
      </Link>

      <p className="text-sm text-neutral-400">
        Tu voz no se comparte con nadie.{" "}
        <Link href="/privacidad" className="underline">
          Cómo la cuidamos
        </Link>
      </p>
    </main>
  );
}
