import Link from "next/link";
import Image from "next/image";
import { LIMITES } from "@/lib/planes";
import type { Textos } from "@/lib/textos/catalogo";

/**
 * El segundo beneficio no se edita desde el panel: lleva el límite real de
 * minutos. Escrito a mano podría prometer un número que la app no cumple.
 */
export function beneficiosPremium(t: Textos): string[] {
  return [
    t["premium.beneficio1"],
    `Hasta ${LIMITES.premium.segundos / 60} minutos por grabación`,
    t["premium.beneficio3"],
    t["premium.beneficio4"],
  ];
}

/**
 * El contenido, sin auth ni base, para que el panel pueda pintarlo igual en
 * la ventana de previsualización.
 *
 * `beneficios` llega armado desde fuera porque el segundo lleva el límite
 * real de minutos: ese no se edita a mano, para que la pantalla de pago no
 * pueda prometer algo que la app no cumple.
 */
export function Contenido({
  t,
  beneficios,
  precioAnual,
  precioMensual,
  accion,
}: {
  t: Textos;
  beneficios: string[];
  precioAnual: number;
  precioMensual: number;
  accion?: (datos: FormData) => void | Promise<void>;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col gap-7 px-[22px] py-8 md:max-w-[480px]">
      <div className="flex items-center justify-between">
        <Link href="/audios" className="text-[19px] text-lavanda-100/70">
          ✕
        </Link>
        <span className="etiqueta text-oro-500">{t["premium.etiqueta"]}</span>
        <span className="w-4" />
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/marca/mintara-badge.png"
          alt=""
          width={58}
          height={58}
          className="flotar"
        />
        <h1 className="display text-[30px] leading-[1.2] text-crema-50">
          {t["premium.titulo"]}
        </h1>
        <p className="text-sm leading-relaxed text-lavanda-100/75">
          {t["premium.cuerpo"]}
        </p>
      </div>

      <ul className="flex flex-col gap-[11px]">
        {beneficios.map((b) => (
          <li key={b} className="flex items-start gap-3 text-sm text-lavanda-100/85">
            <span className="text-menta-400">✓</span>
            {b}
          </li>
        ))}
      </ul>

      <form action={accion} className="mt-auto flex flex-col gap-3">
        <div className="rounded-[18px] border border-oro-500 bg-gradient-to-br from-violeta-500/50 to-rosa-400/20 p-[18px]">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[15px] font-semibold text-crema-50">
                {t["premium.anual.titulo"]}
              </p>
              <p className="text-[13px] text-oro-500">
                {t["premium.anual.nota"]}
              </p>
            </div>
            <p className="display text-[26px] text-crema-50">${precioAnual}</p>
          </div>
        </div>

        <div className="rounded-[18px] border border-lavanda-100/15 bg-white/5 p-[18px]">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[15px] font-semibold text-crema-50">
                {t["premium.mensual.titulo"]}
              </p>
              <p className="text-[13px] text-lavanda-100/60">
                {t["premium.mensual.nota"]}
              </p>
            </div>
            <p className="display text-[26px] text-crema-50">${precioMensual}</p>
          </div>
        </div>

        <button className="mt-2 rounded-full bg-oro-500 px-6 py-4 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]">
          {t["premium.boton"]}
        </button>
        <p className="text-center text-xs text-lavanda-100/55">
          {t["premium.pie"]}
        </p>
      </form>
    </main>
  );
}
