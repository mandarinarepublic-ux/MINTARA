import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { ocultarCelular } from "@/lib/telefono";
import { LIMITES, type Plan } from "@/lib/planes";
import { pedirDesbloqueo, borrarTodo } from "./acciones";

export default async function Cuenta() {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("celular, plan")
    .eq("id", user.id)
    .single();

  const { count } = await supabase
    .from("grabaciones")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", user.id);

  const plan = (perfil?.plan ?? "gratis") as Plan;

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Tu cuenta</h1>
        <p className="mt-2 text-neutral-500">
          {ocultarCelular(perfil?.celular ?? "")}
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 p-4">
        <p className="font-medium">Plan {plan}</p>
        <p className="mt-1 text-sm text-neutral-500">
          {count ?? 0} de {LIMITES[plan].grabaciones} grabaciones usadas
        </p>
        {plan === "gratis" && (
          <form action={pedirDesbloqueo} className="mt-4">
            <button className="rounded-xl bg-neutral-900 px-4 py-3 text-white">
              Quiero más grabaciones
            </button>
          </form>
        )}
      </div>

      <form action={borrarTodo}>
        <button className="text-sm text-red-600 underline">
          Borrar mi voz y mi cuenta para siempre
        </button>
      </form>
    </main>
  );
}
