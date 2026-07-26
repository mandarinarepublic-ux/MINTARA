import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { haceCuanto } from "@/lib/fechas";
import { puedeGrabar, LIMITES, PRECIOS, type Plan } from "@/lib/planes";

export default async function MisAudios() {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const { data: grabaciones } = await supabase
    .from("grabaciones")
    .select("id, creado_en, textos(nombre)")
    .eq("perfil_id", user.id)
    .order("creado_en", { ascending: false });

  const lista = grabaciones ?? [];
  const plan = (perfil?.plan ?? "gratis") as Plan;
  const puedeUnoMas = puedeGrabar(plan, lista.length);
  const ahora = new Date();

  return (
    <main className="mx-auto flex w-full max-w-[402px] flex-col gap-6 px-[22px] py-10 md:max-w-[520px]">
      <div className="flex items-center justify-between">
        <h1 className="display text-[28px] text-crema-50">Mis audios</h1>
        {puedeUnoMas ? (
          <Link href="/estudio" className="text-[13px] text-rosa-400">
            Nuevo +
          </Link>
        ) : (
          <Link href="/cuenta" className="text-[13px] text-oro-500">
            Premium
          </Link>
        )}
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <Image
            src="/marca/mintara-badge.png"
            alt=""
            width={72}
            height={72}
            className="opacity-40"
          />
          <p className="text-lavanda-100/70">Todavía no tienes audios.</p>
          <Link
            href="/estudio"
            className="rounded-full bg-oro-500 px-6 py-3.5 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]"
          >
            Grabar mi voz
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((g) => {
            const nombre =
              (g.textos as { nombre?: string } | null)?.nombre ?? "Mi audio";
            return (
              <li key={g.id}>
                <Link
                  href={`/mezclar/${g.id}`}
                  className="flex items-center gap-4 rounded-[18px] border border-lavanda-100/15 bg-white/5 p-4 transition hover:border-rosa-400 active:scale-[0.99]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rosa-400 text-violeta-600">
                    <span className="ml-0.5 text-lg leading-none">▶</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block truncate text-[18px] text-crema-50">
                      {nombre}
                    </span>
                    <span className="block text-xs text-lavanda-100/60">
                      Mi voz · {haceCuanto(new Date(g.creado_en), ahora)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {!puedeUnoMas && (
        <div className="rounded-[20px] border border-oro-500 bg-gradient-to-br from-violeta-500/50 to-rosa-400/20 p-5">
          <h2 className="display text-[19px] text-crema-50">
            Llegaste a tu límite gratis
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-lavanda-100/80">
            Con Premium guardas todos los audios que quieras, grabas hasta{" "}
            {LIMITES.premium.segundos / 60} minutos y usas río y mar.
          </p>
          <Link
            href="/cuenta"
            className="mt-4 inline-block rounded-full bg-oro-500 px-6 py-3 font-semibold text-violeta-600 transition hover:bg-oro-400"
          >
            Ver Premium
          </Link>
          <p className="mt-2 text-xs text-lavanda-100/60">
            {PRECIOS.mensual.etiqueta} · {PRECIOS.anual.etiqueta}
          </p>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-lavanda-100/10 pt-5 text-[13px]">
        <Link href="/cuenta" className="text-lavanda-100/70 hover:text-crema-50">
          Mi perfil
        </Link>
        <span className="text-lavanda-100/50">
          Solo tú puedes oír estos audios.
        </span>
      </div>
    </main>
  );
}
