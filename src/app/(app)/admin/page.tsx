import { supabaseServidor } from "@/lib/supabase/servidor";
import { agruparPorFamilia, type Ambiente, type Familia } from "@/lib/ambientes";
import { NuevoAmbiente, FilaAmbiente, FormularioFamilia } from "./Formularios";

/** Quién puede entrar aquí lo decide `layout.tsx`, que cubre todo el panel. */
export default async function Admin() {
  const supabase = await supabaseServidor();

  const [{ data: familias }, { data: ambientes }] = await Promise.all([
    supabase.from("familias").select("*").order("orden"),
    supabase.from("ambientes").select("*").order("orden"),
  ]);

  const listaFamilias = (familias ?? []) as Familia[];
  const listaAmbientes = (ambientes ?? []) as Ambiente[];
  const visibles = agruparPorFamilia(listaFamilias, listaAmbientes);

  return (
    <main className="flex w-full max-w-[720px] flex-col gap-8">
      <div>
        <h1 className="display text-[28px] text-crema-50">Ambientes</h1>
        <p className="mt-2 text-sm text-lavanda-100/70">
          Lo que subas aquí aparece en la app al instante, sin desplegar nada.
          Los audios deben durar entre 60 y 90 segundos y empezar y terminar
          parejo, porque se repiten en bucle.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="display text-[21px] text-crema-50">Familias</h2>
        <p className="text-[13px] text-lavanda-100/60">
          Son los grupos que ve el cliente. El nombre y la frase de cada uno
          salen también en la portada, en las tarjetas de ambientes.
        </p>
        <div className="flex flex-col gap-4">
          {listaFamilias.map((f) => (
            <FormularioFamilia key={f.slug} familia={f} />
          ))}
        </div>
      </section>

      <NuevoAmbiente familias={listaFamilias} />

      <section className="flex flex-col gap-6">
        <h2 className="display text-[21px] text-crema-50">
          Ambientes por familia
        </h2>

        {listaAmbientes.length === 0 && (
          <p className="text-sm text-lavanda-100/60">
            Todavía no hay ninguno. Sube el primero arriba.
          </p>
        )}

        {listaFamilias.map((familia) => {
          const suyos = listaAmbientes.filter((a) => a.familia === familia.slug);
          if (suyos.length === 0) return null;
          return (
            <div key={familia.slug} className="flex flex-col gap-3">
              <h3 className="text-[15px] text-crema-50">
                {familia.nombre}{" "}
                <span className="text-lavanda-100/50">· {suyos.length}</span>
              </h3>
              {suyos.map((a) => (
                <FilaAmbiente key={a.id} ambiente={a} familias={listaFamilias} />
              ))}
            </div>
          );
        })}
      </section>

      <p className="text-[13px] text-lavanda-100/55">
        En la app se ven {visibles.length} familias con{" "}
        {visibles.reduce((n, f) => n + f.ambientes.length, 0)} ambientes. Los
        marcados como no visibles quedan guardados pero nadie los ve.
      </p>
    </main>
  );
}
