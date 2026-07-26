import Link from "next/link";
import Image from "next/image";
import { aceptarConsentimiento } from "./acciones";

export default async function Consentimiento({
  searchParams,
}: {
  searchParams: Promise<{ volverA?: string }>;
}) {
  const { volverA } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-[402px] flex-col gap-7 px-[22px] py-10 md:max-w-[520px]">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/marca/mintara-badge.png"
          alt=""
          width={64}
          height={64}
          className="flotar"
        />
        <h1 className="display text-center text-[26px] leading-tight text-crema-50">
          Antes de grabar tu voz
        </h1>
      </div>

      <div className="flex flex-col gap-4 rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[22px] py-[26px] text-sm leading-relaxed text-lavanda-100/80">
        <p>Tu voz es tuya. Esto es lo que hacemos con ella, sin letra chica:</p>
        <ul className="flex flex-col gap-3.5">
          <li>
            <strong className="text-crema-50">La guardamos para ti.</strong> Queda
            en un almacén privado al que nadie llega por una dirección de
            internet. Ninguna persona de nuestro equipo la escucha.
          </li>
          <li>
            <strong className="text-crema-50">No se la mandamos a nadie.</strong>{" "}
            El tratamiento que le da presencia y empareja el volumen ocurre en tu
            propio teléfono, cuando le das play. Tu voz no viaja a ninguna
            empresa ajena, ni siquiera para procesarla.
          </li>
          <li>
            <strong className="text-crema-50">
              Nunca la compartimos ni la vendemos.
            </strong>{" "}
            A nadie, por ningún motivo.
          </li>
          <li>
            <strong className="text-crema-50">
              Puedes borrarla cuando quieras
            </strong>
            , desde tu perfil, en un toque. Borrar es borrar.
          </li>
        </ul>
        <Link href="/privacidad" className="text-[13px] text-menta-400 hover:underline">
          Leer el aviso completo →
        </Link>
      </div>

      <form action={aceptarConsentimiento}>
        <input type="hidden" name="volverA" value={volverA ?? "/estudio"} />
        <button className="w-full rounded-full bg-oro-500 px-6 py-4 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]">
          Entiendo, quiero grabar
        </button>
      </form>
    </main>
  );
}
