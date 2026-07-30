import Link from "next/link";
import Image from "next/image";
import { obtenerTextos } from "@/lib/textos/servidor";
import { salirYVolverAIngresar } from "./acciones";

/**
 * El aviso que evita el susto de la biblioteca vacía.
 *
 * Sale cuando alguien entra por correo y cae en una cuenta recién nacida: es
 * el momento exacto en que una persona que ya usaba MÍNTARA con su celular
 * creería que perdió todo lo que había grabado. Pasó de verdad el 30-jul con
 * dos números, y no es una sensación agradable.
 *
 * Solo se ve una vez. A quien de verdad es nuevo le cuesta un toque.
 */
export default async function CuentaNueva() {
  const t = await obtenerTextos();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col justify-center gap-7 px-[22px] py-10">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/marca/mintara-badge.png"
          alt=""
          width={64}
          height={64}
          className="flotar"
        />
        <h1 className="display text-center text-[26px] leading-tight text-crema-50">
          {t["cuenta_nueva.titulo"]}
        </h1>
      </div>

      <p className="rounded-[22px] border border-lavanda-100/15 bg-white/5 px-[22px] py-[26px] text-sm leading-relaxed text-lavanda-100/80">
        {t["cuenta_nueva.cuerpo"]}
      </p>

      <div className="flex flex-col gap-3">
        <form action={salirYVolverAIngresar}>
          <button className="w-full rounded-full bg-oro-500 px-6 py-4 font-semibold text-violeta-600 transition hover:bg-oro-400 active:scale-[0.97]">
            {t["cuenta_nueva.boton_celular"]}
          </button>
        </form>

        <Link
          href="/estudio"
          className="text-center text-[13px] text-lavanda-100/70 hover:text-crema-50"
        >
          {t["cuenta_nueva.boton_seguir"]}
        </Link>
      </div>
    </main>
  );
}
