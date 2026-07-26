import { redirect, notFound } from "next/navigation";
import Link from "next/link";
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
    .select("id, ruta_master, cortes")
    .eq("id", grabacionId)
    .single();

  if (!grabacion?.ruta_master) notFound();

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
    <main className="mx-auto w-full max-w-[402px] px-[22px] py-8 md:max-w-[520px]">
      <div className="flex items-center justify-between">
        <Link href="/estudio" className="text-[15px] text-lavanda-100/70">
          ← Volver
        </Link>
        <Link href="/cuenta" className="text-[13px] text-rosa-400">
          Mi cuenta
        </Link>
      </div>

      <h1 className="display mt-5 text-[28px] leading-tight text-crema-50">
        Tu audio
      </h1>
      <p className="mt-2 text-sm text-lavanda-100/70">
        Muévelo hasta que suene como lo necesitas.
      </p>

      <div className="mt-7">
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
