import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { ocultarCelular } from "@/lib/telefono";
import { LIMITES, PRECIOS, type Plan } from "@/lib/planes";
import { pedirDesbloqueo, borrarTodo } from "./acciones";

export default async function Cuenta() {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("celular, plan, rol")
    .eq("id", user.id)
    .single();

  const { count } = await supabase
    .from("grabaciones")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", user.id);

  const plan = (perfil?.plan ?? "gratis") as Plan;

  return (
    <main className="mx-auto flex w-full max-w-[402px] flex-col gap-8 px-[22px] py-10 md:max-w-[520px]">
      <Link href="/audios" className="text-[15px] text-lavanda-100/70">
        ← Mis audios
      </Link>

      <h1 className="display text-[28px] text-crema-50">Perfil</h1>

      <div className="rounded-[20px] border border-lavanda-100/15 bg-white/5 p-[18px]">
        <p className="text-[17px] font-semibold text-crema-50">
          {plan === "premium" ? "Premium" : "Plan gratis"}
        </p>
        <p className="mono mt-1 text-xs text-lavanda-100/60">
          {ocultarCelular(perfil?.celular ?? "")}
        </p>
        <p className="mt-3 text-[13px] text-lavanda-100/70">
          {count ?? 0} de {LIMITES[plan].audios} audios ·{" "}
          {LIMITES[plan].segundos / 60} min por grabación
        </p>

        {plan === "gratis" && (
          <form action={pedirDesbloqueo} className="mt-5 flex flex-col gap-2">
            <button className="rounded-full bg-oro-500 px-6 py-3.5 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]">
              Pasar a Premium
            </button>
            <p className="text-center text-xs text-lavanda-100/55">
              {PRECIOS.mensual.etiqueta} · {PRECIOS.anual.etiqueta}
            </p>
          </form>
        )}
      </div>

      <div className="rounded-[18px] border border-menta-400/30 bg-menta-400/10 p-5">
        <p className="etiqueta text-menta-400">Tu voz</p>
        <p className="mt-2 text-sm leading-relaxed text-lavanda-100/80">
          Tus grabaciones son solo tuyas. No se comparten, no se usan para nada
          más y nadie de nuestro equipo las escucha.
        </p>
        <form action={borrarTodo} className="mt-4">
          <button className="text-[13px] text-menta-400 hover:underline">
            Borrar mi voz y mi cuenta para siempre
          </button>
        </form>
      </div>

      {perfil?.rol === "admin" && (
        <Link
          href="/admin"
          className="rounded-[18px] border border-oro-500/40 bg-oro-500/10 px-5 py-4 text-center text-[15px] text-oro-500 transition hover:border-oro-500"
        >
          Administrar ambientes
        </Link>
      )}

      <Link
        href="/privacidad"
        className="text-center text-sm text-lavanda-100/60 hover:text-crema-50"
      >
        Aviso de privacidad
      </Link>
    </main>
  );
}
