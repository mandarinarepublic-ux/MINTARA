import { redirect } from "next/navigation";
import { Formulario } from "./Formulario";

export default async function Verificar({
  searchParams,
}: {
  searchParams: Promise<{ celular?: string }>;
}) {
  const { celular } = await searchParams;
  if (!celular) redirect("/ingresar");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold">Tu código</h1>
      <Formulario celular={celular} />
    </main>
  );
}
