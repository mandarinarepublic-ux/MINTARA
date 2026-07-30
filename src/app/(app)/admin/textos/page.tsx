import Link from "next/link";
import { GRUPOS } from "@/lib/textos/catalogo";
import { obtenerTextos, obtenerTextosParaEditar } from "@/lib/textos/servidor";
import { Editor } from "./Editor";

/**
 * Los textos de la app.
 *
 * El menú va en el orden en que el cliente recorre la app —portada, entrar,
 * consentimiento, elegir afirmaciones, premium—, no alfabético ni por nombre
 * de archivo. Quien edita busca "eso que sale cuando entra" y lo encuentra
 * donde lo espera.
 */
export default async function Textos({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string }>;
}) {
  const [{ grupo: pedido }, textos, guardados] = await Promise.all([
    searchParams,
    obtenerTextos(),
    obtenerTextosParaEditar(),
  ]);

  const grupo = GRUPOS.find((g) => g.id === pedido) ?? GRUPOS[0];

  // Solo se puede deshacer lo que alguna vez se cambió y guardó su anterior.
  const sePuedeDeshacer = Object.entries(guardados)
    .filter(([, fila]) => fila.valorAnterior !== null)
    .map(([clave]) => clave);

  const cambiados = new Set(Object.keys(guardados));

  return (
    <main className="flex w-full flex-col gap-7">
      <div>
        <h1 className="display text-[28px] text-crema-50">Textos</h1>
        <p className="mt-2 text-sm text-lavanda-100/70">
          Cambia lo que lee tu cliente. Lo que guardes sale en la app al
          instante, y cada texto se puede devolver a como estaba.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {GRUPOS.map((g) => {
          const cuantos = g.claves.filter((c) => cambiados.has(c)).length;
          return (
            <Link
              key={g.id}
              href={`/admin/textos?grupo=${g.id}`}
              className={`rounded-full border px-4 py-2 text-[13px] transition ${
                g.id === grupo.id
                  ? "border-transparent bg-lavanda-100 text-violeta-600"
                  : "border-lavanda-100/20 text-lavanda-100/80 hover:border-rosa-400 hover:text-rosa-400"
              }`}
            >
              {g.nombre}
              {cuantos > 0 && (
                <span
                  className={
                    g.id === grupo.id ? "text-violeta-600/60" : "text-oro-500"
                  }
                >
                  {" "}
                  · {cuantos}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <p className="text-[13px] text-lavanda-100/60">{grupo.pista}</p>

      <Editor
        key={grupo.id}
        grupo={grupo}
        textos={textos}
        sePuedeDeshacer={sePuedeDeshacer}
      />
    </main>
  );
}
