"use client";
import { useActionState } from "react";
import {
  crearAmbiente,
  editarAmbiente,
  editarFamilia,
  borrarAmbiente,
  type EstadoAdmin,
} from "./acciones";
import { SubidorDeAudio } from "./SubidorDeAudio";
import type { Ambiente, Familia } from "@/lib/ambientes";

function Aviso({ estado }: { estado: EstadoAdmin }) {
  if (estado.error) return <p className="text-[13px] text-rosa-400">{estado.error}</p>;
  if (estado.ok) return <p className="text-[13px] text-menta-400">{estado.ok}</p>;
  return null;
}

const campo =
  "rounded-[12px] border border-lavanda-100/20 bg-violeta-900/60 px-3 py-2.5 text-[14px] text-crema-50 focus:border-rosa-400 focus:outline-none";

export function NuevoAmbiente({ familias }: { familias: Familia[] }) {
  const [estado, accion, pendiente] = useActionState<EstadoAdmin, FormData>(
    crearAmbiente,
    {},
  );

  return (
    <form
      action={accion}
      className="flex flex-col gap-3 rounded-[18px] border border-menta-400/30 bg-menta-400/5 p-5"
    >
      <h3 className="display text-[19px] text-crema-50">Agregar un ambiente</h3>

      <label className="flex flex-col gap-1.5">
        <span className="etiqueta text-lavanda-100/60">Familia</span>
        <select name="familia" className={campo} defaultValue={familias[0]?.slug}>
          {familias.map((f) => (
            <option key={f.slug} value={f.slug} className="bg-violeta-700">
              {f.nombre}
            </option>
          ))}
        </select>
      </label>

      <input
        type="file"
        name="audio"
        accept="audio/*"
        required
        className="text-[13px] text-lavanda-100/70 file:mr-3 file:rounded-full file:border file:border-lavanda-100/25 file:bg-transparent file:px-4 file:py-2 file:text-[13px] file:text-crema-50"
      />

      <label className="flex flex-col gap-1.5">
        <span className="etiqueta text-lavanda-100/60">Nombre de la variante</span>
        <input
          name="nombre"
          required
          maxLength={60}
          placeholder="Lluvia sobre techo"
          className={campo}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="etiqueta text-lavanda-100/60">Orden</span>
          <input name="orden" type="number" defaultValue={1} min={0} className={campo} />
        </label>
        <label className="flex items-end gap-2 pb-2.5">
          <input name="gratis" type="checkbox" className="accent-menta-400" />
          <span className="text-[13px] text-lavanda-100/80">Gratis</span>
        </label>
      </div>

      <Aviso estado={estado} />

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-full bg-oro-500 px-5 py-3 font-semibold text-violeta-600 transition hover:bg-oro-400 disabled:opacity-50"
      >
        {pendiente ? "Guardando…" : "Agregar"}
      </button>
    </form>
  );
}

export function FilaAmbiente({ ambiente }: { ambiente: Ambiente }) {
  const [estado, accion, pendiente] = useActionState<EstadoAdmin, FormData>(
    editarAmbiente,
    {},
  );

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-lavanda-100/15 bg-white/5 p-4">
      <form action={accion} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={ambiente.id} />

        <input
          name="nombre"
          defaultValue={ambiente.nombre}
          maxLength={60}
          className={campo}
        />

        <audio
          controls
          preload="none"
          src={`https://piingkecjgoisnxccvaa.supabase.co/storage/v1/object/public/fondos/${ambiente.ruta}`}
          className="w-full"
        />

        <SubidorDeAudio familia={ambiente.familia} rutaActual={ambiente.ruta} />

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="etiqueta text-lavanda-100/60">Orden</span>
            <input
              name="orden"
              type="number"
              defaultValue={ambiente.orden}
              min={0}
              className={`${campo} w-20`}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              name="gratis"
              type="checkbox"
              defaultChecked={ambiente.gratis}
              className="accent-menta-400"
            />
            <span className="text-[13px] text-lavanda-100/80">Gratis</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              name="activo"
              type="checkbox"
              defaultChecked={ambiente.activo}
              className="accent-menta-400"
            />
            <span className="text-[13px] text-lavanda-100/80">Visible</span>
          </label>
        </div>

        <Aviso estado={estado} />

        <button
          type="submit"
          disabled={pendiente}
          className="self-start rounded-full border border-lavanda-100/25 px-4 py-2 text-[13px] text-crema-50 transition hover:border-crema-50 disabled:opacity-50"
        >
          {pendiente ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      <form action={borrarAmbiente}>
        <input type="hidden" name="id" value={ambiente.id} />
        <button className="text-[12px] text-rosa-400 hover:underline">
          Borrar este ambiente
        </button>
      </form>
    </div>
  );
}

export function FormularioFamilia({ familia }: { familia: Familia }) {
  const [estado, accion, pendiente] = useActionState<EstadoAdmin, FormData>(
    editarFamilia,
    {},
  );

  return (
    <form action={accion} className="flex flex-col gap-2 border-b border-lavanda-100/10 pb-4">
      <input type="hidden" name="slug" value={familia.slug} />
      <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
        <input name="nombre" defaultValue={familia.nombre} className={campo} />
        <input
          name="descripcion"
          defaultValue={familia.descripcion}
          className={campo}
          placeholder="Para dormir y soltar el día"
        />
        <input
          name="orden"
          type="number"
          defaultValue={familia.orden}
          className={`${campo} w-20`}
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            name="activa"
            type="checkbox"
            defaultChecked={familia.activa}
            className="accent-menta-400"
          />
          <span className="text-[13px] text-lavanda-100/80">Visible</span>
        </label>
        <button
          type="submit"
          disabled={pendiente}
          className="text-[13px] text-rosa-400 hover:underline disabled:opacity-50"
        >
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}
