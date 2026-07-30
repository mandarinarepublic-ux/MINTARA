import { obtenerPaquetesParaEditar } from "@/lib/afirmaciones/servidor";
import { PAQUETES } from "@/lib/afirmaciones/paquetes";
import { traerListasDelCodigo } from "./acciones";
import { Lista } from "./Lista";
import { Nueva } from "./Nueva";

/**
 * Las listas de afirmaciones: lo que el cliente lee en voz alta.
 *
 * Aquí sí hay libertad completa —agregar, quitar, reordenar y crear listas—
 * porque esto es contenido y cambia seguido, a diferencia de la estructura de
 * las pantallas.
 */
export default async function Afirmaciones() {
  const listas = await obtenerPaquetesParaEditar();
  const activas = listas.filter((l) => l.activo);

  return (
    <main className="flex w-full max-w-[760px] flex-col gap-6">
      <div>
        <h1 className="display text-[28px] text-crema-50">Afirmaciones</h1>
        <p className="mt-2 text-sm text-lavanda-100/70">
          Las listas que tu cliente elige antes de grabar. Lo que guardes sale
          en la app al instante.
        </p>
      </div>

      {listas.length === 0 ? (
        <form
          action={traerListasDelCodigo}
          className="flex flex-col gap-3 rounded-[22px] border border-lavanda-100/15 bg-white/5 px-5 py-6"
        >
          <h2 className="display text-[18px] text-crema-50">
            Todavía no has tocado ninguna lista
          </h2>
          <p className="text-sm leading-relaxed text-lavanda-100/70">
            La app está usando las {PAQUETES.length} listas de siempre
            ({PAQUETES.map((p) => p.nombre).join(", ")}). Tráelas aquí para poder
            editarlas. Tu cliente no va a notar nada: son exactamente las
            mismas.
          </p>
          <button className="self-start rounded-full bg-oro-500 px-5 py-2.5 text-[14px] font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]">
            Traer las {PAQUETES.length} listas
          </button>
        </form>
      ) : (
        <>
          <p className="text-[13px] text-lavanda-100/60">
            {activas.length} encendidas de {listas.length}. Las apagadas quedan
            guardadas pero nadie las ve.
          </p>

          {listas.map((l) => (
            <Lista
              key={l.id}
              lista={{
                id: l.id,
                nombre: l.nombre,
                descripcion: l.descripcion,
                activo: l.activo,
                frases: l.frases,
              }}
              esLaUnicaActiva={activas.length <= 1}
            />
          ))}
        </>
      )}

      <Nueva />
    </main>
  );
}
