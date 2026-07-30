import { obtenerTextos } from "@/lib/textos/servidor";
import { aceptarConsentimiento } from "./acciones";
import { Contenido } from "./Contenido";

export default async function Consentimiento({
  searchParams,
}: {
  searchParams: Promise<{ volverA?: string }>;
}) {
  const [{ volverA }, t] = await Promise.all([searchParams, obtenerTextos()]);
  return <Contenido t={t} volverA={volverA} accion={aceptarConsentimiento} />;
}
