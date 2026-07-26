import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { duracionMaximaSeg, type Plan } from "@/lib/planes";
import { Grabador } from "./Grabador";

export default async function Grabar({
  params,
}: {
  params: Promise<{ textoId: string }>;
}) {
  const { textoId } = await params;
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("consentimiento_en, plan")
    .eq("id", user.id)
    .single();

  if (!perfil?.consentimiento_en) {
    redirect(`/consentimiento?volverA=/grabar/${textoId}`);
  }

  const { data: texto } = await supabase
    .from("textos")
    .select("id, frases")
    .eq("id", textoId)
    .single();

  if (!texto) notFound();

  const plan = (perfil?.plan ?? "gratis") as Plan;

  return (
    <main className="mx-auto flex w-full max-w-[402px] flex-col px-[22px] py-8 md:max-w-[520px]">
      <div className="flex items-center justify-between">
        <Link href="/estudio" className="text-[15px] text-lavanda-100/70">
          ← Volver
        </Link>
        <span className="text-xs text-lavanda-100/50">Paso 2 de 2</span>
      </div>

      <h1 className="display mt-5 text-[28px] leading-tight text-crema-50">
        Lee esto en voz alta
      </h1>
      <p className="mt-2 text-sm text-lavanda-100/70">
        Tranquila, puedes repetirlo cuantas veces quieras.
      </p>

      <div className="mt-6 flex-1">
        <Grabador
          textoId={texto.id}
          perfilId={user.id}
          frases={texto.frases}
          segundosMaximos={duracionMaximaSeg(plan)}
        />
      </div>
    </main>
  );
}
