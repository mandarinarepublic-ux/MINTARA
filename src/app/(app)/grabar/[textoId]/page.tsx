import { redirect, notFound } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";
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
    .select("consentimiento_en")
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

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <p className="text-sm text-neutral-500">
        Léelo completo, sin apuro. Si te trabas, sigue: después lo limpiamos.
      </p>
      <div className="mt-6">
        <Grabador textoId={texto.id} perfilId={user.id} frases={texto.frases} />
      </div>
    </main>
  );
}
