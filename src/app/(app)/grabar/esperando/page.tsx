import { redirect } from "next/navigation";
import { Espera } from "./Espera";

export default async function Esperando({
  searchParams,
}: {
  searchParams: Promise<{ grabacion?: string }>;
}) {
  const { grabacion } = await searchParams;
  if (!grabacion) redirect("/estudio");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Puliendo tu voz</h1>
      <Espera grabacionId={grabacion} />
    </main>
  );
}
