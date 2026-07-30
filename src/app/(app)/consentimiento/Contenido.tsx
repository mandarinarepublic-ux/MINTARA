import Link from "next/link";
import Image from "next/image";
import type { Textos } from "@/lib/textos/catalogo";

/**
 * El contenido, sin nada de servidor, para que el panel pueda pintarlo igual
 * en la ventana de previsualización.
 *
 * `accion` llega vacía cuando esto se pinta como previsualización: ahí el
 * formulario no tiene a dónde enviar, y además el panel lo envuelve en un
 * contenedor que no deja tocar nada.
 */
export function Contenido({
  t,
  volverA,
  accion,
}: {
  t: Textos;
  volverA?: string;
  accion?: (datos: FormData) => void | Promise<void>;
}) {
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
          {t["consentimiento.titulo"]}
        </h1>
      </div>

      <div className="flex flex-col gap-4 rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[22px] py-[26px] text-sm leading-relaxed text-lavanda-100/80">
        <p>{t["consentimiento.entrada"]}</p>
        <ul className="flex flex-col gap-3.5">
          <li>
            <strong className="text-crema-50">
              {t["consentimiento.punto1.titulo"]}
            </strong>{" "}
            {t["consentimiento.punto1.cuerpo"]}
          </li>
          <li>
            <strong className="text-crema-50">
              {t["consentimiento.punto2.titulo"]}
            </strong>{" "}
            {t["consentimiento.punto2.cuerpo"]}
          </li>
          <li>
            <strong className="text-crema-50">
              {t["consentimiento.punto3.titulo"]}
            </strong>{" "}
            {t["consentimiento.punto3.cuerpo"]}
          </li>
          <li>
            <strong className="text-crema-50">
              {t["consentimiento.punto4.titulo"]}
            </strong>
            {t["consentimiento.punto4.cuerpo"]}
          </li>
        </ul>
        <Link href="/privacidad" className="text-[13px] text-menta-400 hover:underline">
          {t["consentimiento.enlace"]}
        </Link>
      </div>

      <form action={accion}>
        <input type="hidden" name="volverA" value={volverA ?? "/estudio"} />
        <button className="w-full rounded-full bg-oro-500 px-6 py-4 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]">
          {t["consentimiento.boton"]}
        </button>
      </form>
    </main>
  );
}
