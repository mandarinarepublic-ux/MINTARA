import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { Pestanas } from "./Pestanas";

/**
 * La comprobación de administrador vive aquí, en el layout, para que valga
 * para todas las pantallas del panel de una sola vez. Si estuviera en cada
 * página, agregar una nueva y olvidarse de copiarla la dejaría abierta.
 */
export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  // Quien no administra no ve que esto existe: se va a su biblioteca.
  if (perfil?.rol !== "admin") redirect("/audios");

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-[22px] py-8">
      <div className="flex items-center justify-between">
        <Link href="/audios" className="text-[15px] text-lavanda-100/70">
          ← Mis audios
        </Link>
        <span className="etiqueta text-oro-500">Administración</span>
      </div>

      <Pestanas />

      {children}
    </div>
  );
}
