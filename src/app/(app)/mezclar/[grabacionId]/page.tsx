import { redirect, notFound } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { fondosPermitidos, type Plan } from "@/lib/planes";
import { Mezclador } from "./Mezclador";

export default async function Mezclar({
  params,
}: {
  params: Promise<{ grabacionId: string }>;
}) {
  const { grabacionId } = await params;
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: grabacion } = await supabase
    .from("grabaciones")
    .select("id, estado, ruta_master, cortes")
    .eq("id", grabacionId)
    .single();

  if (!grabacion) notFound();
  if (grabacion.estado !== "lista" || !grabacion.ruta_master) {
    redirect(`/grabar/esperando?grabacion=${grabacionId}`);
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  // URL firmada de una hora: la voz nunca se sirve por una dirección
  // pública ni adivinable.
  const { data: firmada } = await supabase.storage
    .from("voces")
    .createSignedUrl(grabacion.ruta_master, 3600);

  if (!firmada) notFound();

  const plan = (perfil?.plan ?? "gratis") as Plan;

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-semibold">Tu audio</h1>
      <div className="mt-8">
        <Mezclador
          grabacionId={grabacion.id}
          vozUrl={firmada.signedUrl}
          cortesGuardados={grabacion.cortes}
          fondosPermitidos={fondosPermitidos(plan)}
          planUsuario={plan}
        />
      </div>
    </main>
  );
}
