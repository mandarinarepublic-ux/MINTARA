import { redirect } from "next/navigation";
import Image from "next/image";
import { Formulario } from "./Formulario";

export default async function Verificar({
  searchParams,
}: {
  searchParams: Promise<{ celular?: string }>;
}) {
  const { celular } = await searchParams;
  if (!celular) redirect("/ingresar");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col justify-center gap-9 px-[22px] py-10">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/marca/mintara-badge.png"
          alt="Míntara"
          width={72}
          height={72}
          priority
          className="flotar"
        />
        <h1 className="display text-[32px] leading-none text-crema-50">Míntara</h1>
      </div>

      <Formulario celular={celular} />
    </main>
  );
}
