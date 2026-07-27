import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { planEfectivo, LIMITES, PRECIOS, type Plan } from "@/lib/planes";
import { pedirDesbloqueo } from "../cuenta/acciones";

/**
 * Pantalla Premium (handoff 3.5).
 *
 * El handoff listaba también "la IA mejora tus afirmaciones" como beneficio.
 * No aparece aquí a propósito: esa función se decidió dejar fuera, y prometer
 * en la pantalla de pago algo que la app no hace es la peor forma de perder
 * a alguien que acaba de pagar.
 */
export default async function Premium() {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan, rol")
    .eq("id", user.id)
    .single();

  const plan = planEfectivo((perfil?.plan ?? "gratis") as Plan, perfil?.rol);
  if (plan === "premium") redirect("/audios");

  const beneficios = [
    "Todos los audios que quieras",
    `Hasta ${LIMITES.premium.segundos / 60} minutos por grabación`,
    "Lluvia, río y mar, con todas sus variantes",
    "Guardarlos para oírlos sin internet",
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col gap-7 px-[22px] py-8 md:max-w-[480px]">
      <div className="flex items-center justify-between">
        <Link href="/audios" className="text-[19px] text-lavanda-100/70">
          ✕
        </Link>
        <span className="etiqueta text-oro-500">Premium</span>
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
          Tu voz, sin límites
        </h1>
        <p className="text-sm leading-relaxed text-lavanda-100/75">
          Todos los audios que quieras, los tres ambientes y tus grabaciones
          guardadas para escucharlas donde sea.
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

      <form action={pedirDesbloqueo} className="mt-auto flex flex-col gap-3">
        <div className="rounded-[18px] border border-oro-500 bg-gradient-to-br from-violeta-500/50 to-rosa-400/20 p-[18px]">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[15px] font-semibold text-crema-50">Un año</p>
              <p className="text-[13px] text-oro-500">Casi 5 meses de regalo</p>
            </div>
            <p className="display text-[26px] text-crema-50">
              ${PRECIOS.anual.monto}
            </p>
          </div>
        </div>

        <div className="rounded-[18px] border border-lavanda-100/15 bg-white/5 p-[18px]">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[15px] font-semibold text-crema-50">Un mes</p>
              <p className="text-[13px] text-lavanda-100/60">
                Cancelas cuando quieras
              </p>
            </div>
            <p className="display text-[26px] text-crema-50">
              ${PRECIOS.mensual.monto}
            </p>
          </div>
        </div>

        <button className="mt-2 rounded-full bg-oro-500 px-6 py-4 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]">
          Empezar ahora
        </button>
        <p className="text-center text-xs text-lavanda-100/55">
          Te escribimos por WhatsApp para activarlo. Cancelas cuando quieras.
        </p>
      </form>
    </main>
  );
}
