import Link from "next/link";
import { aceptarConsentimiento } from "./acciones";

export default async function Consentimiento({
  searchParams,
}: {
  searchParams: Promise<{ volverA?: string }>;
}) {
  const { volverA } = await searchParams;

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Antes de grabar tu voz</h1>

      <div className="flex flex-col gap-4 text-neutral-700">
        <p>Tu voz es tuya. Esto es lo que hacemos con ella, sin letra chica:</p>
        <ul className="flex flex-col gap-3 pl-5 [&>li]:list-disc">
          <li>
            <strong>La guardamos para ti.</strong> Queda en un almacén privado al
            que nadie llega por una dirección de internet. Ninguna persona de
            nuestro equipo la escucha.
          </li>
          <li>
            <strong>No se la mandamos a nadie.</strong> El tratamiento que le da
            presencia y empareja el volumen ocurre en tu propio teléfono, cuando
            le das play. Tu voz no viaja a ninguna empresa ajena, ni siquiera
            para procesarla.
          </li>
          <li>
            <strong>Nunca la compartimos ni la vendemos.</strong> A nadie, por
            ningún motivo.
          </li>
          <li>
            <strong>Puedes borrarla cuando quieras</strong>, desde tu cuenta, en
            un toque. Borrar es borrar.
          </li>
        </ul>
        <p className="text-sm text-neutral-500">
          Puedes leer el{" "}
          <Link href="/privacidad" className="underline">
            aviso completo
          </Link>
          .
        </p>
      </div>

      <form action={aceptarConsentimiento}>
        <input type="hidden" name="volverA" value={volverA ?? "/estudio"} />
        <button className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-white">
          Entiendo, quiero grabar
        </button>
      </form>
    </main>
  );
}
