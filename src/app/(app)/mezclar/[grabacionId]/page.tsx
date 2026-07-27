import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { exigirEntorno } from "@/lib/entorno";
import { type Plan } from "@/lib/planes";
import {
  agruparPorFamilia,
  ambientesPermitidos,
  urlDeAmbiente,
  type Ambiente,
  type Familia,
} from "@/lib/ambientes";
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

  const [{ data: grabacion }, { data: perfil }, { data: familias }, { data: ambientes }] =
    await Promise.all([
      supabase
        .from("grabaciones")
        .select("id, ruta_master, cortes, textos(nombre)")
        .eq("id", grabacionId)
        .single(),
      supabase.from("perfiles").select("plan").eq("id", user.id).single(),
      supabase.from("familias").select("*").order("orden"),
      supabase.from("ambientes").select("*").order("orden"),
    ]);

  if (!grabacion?.ruta_master) notFound();

  // El nombre del paquete es lo que la persona verá en la pantalla de
  // bloqueo de su teléfono mientras suena.
  const titulo =
    (grabacion.textos as { nombre?: string } | null)?.nombre ?? "Mi audio";

  // URL firmada de una hora: la voz nunca se sirve por una dirección
  // pública ni adivinable. Los ambientes sí son públicos: son lluvia y mar.
  const { data: firmada } = await supabase.storage
    .from("voces")
    .createSignedUrl(grabacion.ruta_master, 3600);

  if (!firmada) notFound();

  const plan = (perfil?.plan ?? "gratis") as Plan;
  const listaFamilias = (familias ?? []) as Familia[];
  const listaAmbientes = (ambientes ?? []) as Ambiente[];

  const urlSupabase = exigirEntorno("NEXT_PUBLIC_SUPABASE_URL");
  const urlDe = Object.fromEntries(
    listaAmbientes.map((a) => [a.id, urlDeAmbiente(a.ruta, urlSupabase)]),
  );

  return (
    <main className="mx-auto w-full max-w-[402px] px-[22px] py-8 md:max-w-[520px]">
      <div className="flex items-center justify-between">
        <Link href="/audios" className="text-[15px] text-lavanda-100/70">
          ← Mis audios
        </Link>
        <Link href="/cuenta" className="text-[13px] text-rosa-400">
          Mi perfil
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
          titulo={titulo}
          vozUrl={firmada.signedUrl}
          cortesGuardados={grabacion.cortes}
          familias={agruparPorFamilia(listaFamilias, listaAmbientes)}
          permitidos={ambientesPermitidos(listaAmbientes, plan).map((a) => a.id)}
          urlDe={urlDe}
          planUsuario={plan}
        />
      </div>
    </main>
  );
}
